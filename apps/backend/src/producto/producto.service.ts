import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Producto } from './producto.entity';
import { ComboDetalle } from './combo-detalle.entity';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private repo: Repository<Producto>,
    private dataSource: DataSource, // Para transacciones seguras
  ) {}

  // --- MÉTODOS DE CONSULTA ---

  async findAll() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async findById(id: string): Promise<Producto | null> {
    return this.repo.findOneBy({ id });
  }

  async findDisponibles() {
    const productos = await this.repo.find({
      where: { activo: true },
      relations: ['comboDetalles', 'comboDetalles.producto'],
    });

    return productos.filter((p) => {
      // Si es producto normal: solo checkeamos su stock
      if (!p.esCombo) return p.stock > 0;
      
      // Si es combo: verificar que todos sus componentes tengan stock suficiente
      if (p.comboDetalles && p.comboDetalles.length > 0) {
        return p.comboDetalles.every(
          (d) => d.producto && d.producto.stock >= d.cantidad
        );
      }
      return false;
    });
  }

  // --- MÉTODOS DE ESCRITURA (PRODUCTOS SIMPLES) ---

  async create(data: Partial<Producto>) {
    // Corregido: usamos 'data' que es lo que recibe la función
    const producto = this.repo.create(data); 
    return this.repo.save(producto);
  }

  async update(id: string, data: Partial<Producto>) {
    const producto = await this.repo.findOneBy({ id });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    // Si es un combo, forzamos que el stock sea 0 (es virtual)
    if (producto.esCombo) data.stock = 0;

    Object.assign(producto, data);
    return this.repo.save(producto);
  }

  async delete(id: string) {
    const producto = await this.repo.findOneBy({ id });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return this.repo.delete(id);
  }

  // --- LÓGICA DE COMBOS ---

  async crearCombo(data: { nombre: string; precio: number; items: any[] }) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('El combo debe tener al menos un producto');
    }

    const combo = this.repo.create({
      nombre: data.nombre,
      precio: data.precio,
      esCombo: true,
      stock: 0, 
      comboDetalles: data.items.map(i => ({
        productoId: i.productoId,
        cantidad: i.cantidad
      }))
    });

    return this.repo.save(combo);
  }

  // --- GESTIÓN DE STOCK (CON TRANSACCIONES Y RECURSIVIDAD) ---

  async descontarStock(items: { productoId: string; cantidad: number }[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.ejecutarDescuento(items, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (err: any) { // Corregido: tipado 'any' para evitar error de 'unknown'
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err?.message || 'Error al procesar el stock');
    } finally {
      await queryRunner.release();
    }
  }

  // Método privado que se llama a sí mismo si encuentra combos dentro de combos
  private async ejecutarDescuento(items: any[], manager: EntityManager) {
    for (const item of items) {
      const p = await manager.findOne(Producto, {
        where: { id: item.productoId },
        relations: ['comboDetalles'],
      });

      if (!p) throw new Error(`Producto con ID ${item.productoId} no existe`);

      if (p.esCombo) {
        // Lógica de Combo: multiplicamos la cantidad del item por lo que pide el combo
        const hijos = p.comboDetalles.map((d) => ({
          productoId: d.productoId,
          cantidad: d.cantidad * item.cantidad,
        }));
        // RECURSIÓN
        await this.ejecutarDescuento(hijos, manager);
      } else {
        // Lógica de Producto Simple: validamos stock real
        if (p.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para ${p.nombre}. Requerido: ${item.cantidad}, Disponible: ${p.stock}`);
        }
        p.stock -= item.cantidad;
        await manager.save(p);
      }
    }
  }
}