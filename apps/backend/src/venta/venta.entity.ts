import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { VentaDetalle } from './venta-detalle.entity';

@Entity()
export class Venta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  metodoPago!: string;

  @Column('decimal', { precision: 10, scale: 2, default:0 })
  total!: number;

  // 🔥 Fecha automática
  @CreateDateColumn()
  fecha!: Date;

  @OneToMany(() => VentaDetalle, detalle => detalle.venta, {
    cascade: true,
  })
  detalles!: VentaDetalle[];
}