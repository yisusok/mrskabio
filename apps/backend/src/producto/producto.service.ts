import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Producto } from './producto.entity';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private repo: Repository<Producto>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  create(data: Partial<Producto>) {
    const producto = this.repo.create(data);
    return this.repo.save(producto);
  }

  findDisponibles() {
    return this.repo.find({
      where: {
        activo: true,
        stock: MoreThan(0),
      },
    });
  }

  // 🔑 Nuevo método público para buscar producto por ID
  async findById(id: string): Promise<Producto | null> {
    return this.repo.findOneBy({ id });
  }

  // 🔑 Método público para descontar stock
  async descontarStock(items: { productoId: string; cantidad: number }[]) {
    for (const item of items) {
      const producto = await this.findById(item.productoId);
      if (producto) {
        producto.stock -= item.cantidad;
        await this.repo.save(producto);
      }
    }
  }

  async update(id: string, data: { nombre: string; precio: number; stock: number }) {
  const producto = await this.repo.findOneBy({ id });
  if (!producto) throw new Error('Producto no encontrado');

  producto.nombre = data.nombre;
  producto.precio = data.precio;
  producto.stock = data.stock;

  return this.repo.save(producto);
}

async delete(id: string) {
  return this.repo.delete(id);
}
}