import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './venta.entity';
import { ProductoService } from '../producto/producto.service';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private repo: Repository<Venta>,
    private productoService: ProductoService,
  ) {}

  async createVenta(data: { metodoPago: string; items: { productoId: string; cantidad: number }[] }) {
    // 🔥 Calcular total
    let total = 0;
    for (const item of data.items) {
      const producto = await this.productoService.findById(item.productoId);
      if (producto) total += Number(producto.precio) * item.cantidad;
    }

    // 1️⃣ Guardar venta
    const venta = this.repo.create({ ...data, total });
    await this.repo.save(venta);

    // 2️⃣ Descontar stock
    await this.productoService.descontarStock(data.items);

    return venta;
  }
}