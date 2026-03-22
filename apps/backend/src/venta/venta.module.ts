import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './venta.entity';
import { VentaDetalle } from './venta-detalle.entity';
import { Producto } from '../producto/producto.entity';
import { VentaController } from './venta.controller';
import { VentaService } from './venta.service';
import { Module } from '@nestjs/common';
import { ProductoModule } from 'src/producto/producto.module';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, VentaDetalle, Producto]),
  ProductoModule],
  controllers: [VentaController],
  providers: [VentaService],
})
export class VentaModule {}