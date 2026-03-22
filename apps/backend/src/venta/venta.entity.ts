import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VentaDetalle } from './venta-detalle.entity';

@Entity()
export class Venta {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // 🔥 Viene generado por la DB

  @Column()
  metodoPago!: string;

  @Column({ type: 'float' })
  total!: number;

  @OneToMany(() => VentaDetalle, detalle => detalle.venta, { cascade: true })
  detalles!: VentaDetalle[]; // 🔥 Aquí TypeScript ya sabe que es un array de VentaDetalle
}