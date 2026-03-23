import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './producto.entity';
import { ComboDetalle } from './combo-detalle.entity';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, ComboDetalle])],
  providers: [ProductoService],
  controllers: [ProductoController],
  exports: [ProductoService], // 🔥 ASEGURATE QUE ESTO ESTÉ AQUÍ
})
export class ProductoModule {}