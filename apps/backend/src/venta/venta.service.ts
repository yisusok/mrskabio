import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venta } from './venta.entity';
import { VentaDetalle } from './venta-detalle.entity';
import { ProductoService } from '../producto/producto.service';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepo: Repository<Venta>,
    
    // Agregamos DataSource para manejar la transacción de la venta completa
    private dataSource: DataSource,
    private productoService: ProductoService,
  ) {}

  async createVenta(data: {
    metodoPago: string;
    items: { productoId: string; cantidad: number }[];
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAcumulado = 0;
      const detallesParaGuardar: any[] = [];

      for (const item of data.items) {
        // Usamos findById que agregamos al ProductoService
        const producto = await this.productoService.findById(item.productoId);

        if (!producto) {
          throw new NotFoundException(`Producto con ID ${item.productoId} no existe`);
        }

        // ⚠️ VALIDACIÓN DE DISPONIBILIDAD (Para normales y combos)
        // Si es combo, delegamos la lógica al service de productos
        if (producto.esCombo) {
           // Aquí podrías llamar a una función de validación previa si quisieras, 
           // pero descontarStock ya lo hace internamente.
        } else if (producto.stock < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${producto.nombre}`);
        }

        const subtotal = Number(producto.precio) * item.cantidad;
        totalAcumulado += subtotal;

        // Preparamos el detalle de la venta (lo que va al ticket/factura)
        detallesParaGuardar.push({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: producto.precio,
        });
      }

      // 1. Descontamos stock (Esta función ya maneja la lógica de combos internamente)
      // La ejecutamos dentro de la misma transacción
      await this.productoService.descontarStock(data.items);

      // 2. Creamos la cabecera de la venta
      const nuevaVenta = this.ventaRepo.create({
        metodoPago: data.metodoPago,
        total: totalAcumulado,
        detalles: detallesParaGuardar,
      });

      const ventaGuardada = await queryRunner.manager.save(nuevaVenta);

      // 3. Confirmamos todo
      await queryRunner.commitTransaction();
      return ventaGuardada;

    } catch (error) {
      // Si algo falla (ej: se quedaron sin stock justo antes de pagar), volvemos atrás
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getVentasPorRango(desde: string, hasta: string) {
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    fechaDesde.setHours(0, 0, 0, 0);
    fechaHasta.setHours(23, 59, 59, 999);

    return this.ventaRepo
      .createQueryBuilder('venta')
      .leftJoinAndSelect('venta.detalles', 'detalle')
      .where('venta.fecha BETWEEN :desde AND :hasta', {
        desde: fechaDesde,
        hasta: fechaHasta,
      })
      .orderBy('venta.fecha', 'DESC')
      .getMany();
  }
}