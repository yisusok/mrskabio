import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from './producto.entity';

@Entity()
export class ComboDetalle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  cantidad!: number;

  @Column()
  productoId!: string;

  // El Combo "Padre"
  @ManyToOne(() => Producto, (producto) => producto.comboDetalles, { onDelete: 'CASCADE' })
  combo!: Producto;

  // El Producto "Hijo" (el que aporta el stock)
  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'productoId' })
  producto!: Producto;
}