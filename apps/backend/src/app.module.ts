import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoModule } from './producto/producto.module';
import { VentaModule } from './venta/venta.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Jesusarevalo12',
      database: 'mrskabio',
      autoLoadEntities: true,
      synchronize: true, // SOLO desarrollo
    }),
    ProductoModule,
    VentaModule,
  ],
})
export class AppModule {}