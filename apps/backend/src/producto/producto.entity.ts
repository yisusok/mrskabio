import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ComboDetalle } from './combo-detalle.entity';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column('decimal', { precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  precio!: number;

  @Column({ default: 0 })
  stock!: number;

  @Column({ default: true })
  activo!: boolean;

  @Column({ default: false })
  esCombo!: boolean;

  @OneToMany(() => ComboDetalle, (detalle) => detalle.combo, {
    cascade: true,
    eager: false // No cargamos detalles siempre para ahorrar memoria
  })
  comboDetalles!: ComboDetalle[];
}