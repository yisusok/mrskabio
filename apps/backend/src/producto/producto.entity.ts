import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio!: number;

  @Column('int')
  stock!: number;

  @Column({ default: true })
  activo!: boolean;
}