import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { Producto } from './producto.entity';

@Controller('producto')
export class ProductoController {
  constructor(private readonly service: ProductoService) {}

  @Get()
  findAll(): Promise<Producto[]> {
    return this.service.findAll();
  }

  @Get('disponibles')
  findDisponibles(): Promise<Producto[]> {
    return this.service.findDisponibles();
  }

  @Post()
  create(@Body() body: Partial<Producto>): Promise<Producto> {
    return this.service.create(body);
  }

  @Post('descontar-stock')
  descontarStock(@Body() items: { productoId: string; cantidad: number }[]) {
    return this.service.descontarStock(items);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

@Delete(':id')
async delete(@Param('id') id: string) {
  return this.service.delete(id);
}
}