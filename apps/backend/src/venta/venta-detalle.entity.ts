import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Venta } from '../venta/venta.entity';

@Entity()
export class VentaDetalle {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // 🔥 Generado por DB

  @ManyToOne(() => Venta, venta => venta.detalles)
  venta!: Venta; // 🔥 Marca que siempre existe la venta asociada

  @Column()
  productoId!: string;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'float' })
  precio!: number;
}