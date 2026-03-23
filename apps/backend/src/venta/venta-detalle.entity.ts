import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Venta } from './venta.entity';

@Entity()
export class VentaDetalle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  productoId!: string;

  @Column()
  cantidad!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio!: number;

  // 🔥 RELACIÓN CORRECTA
  @ManyToOne(() => Venta, venta => venta.detalles, {
    onDelete: 'CASCADE',
  })
  venta!: Venta;
}