import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ProductoService } from './producto.service';

@Controller('producto')
export class ProductoController {
  constructor(private readonly service: ProductoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('disponibles')
  findDisponibles() {
    return this.service.findDisponibles();
  }

  // 🔥 NUEVO: Para crear productos simples (lo que te daba el alert de error)
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  // Para crear combos
  @Post('combo')
  crearCombo(@Body() body: any) {
    return this.service.crearCombo(body);
  }

  // Para descontar stock manualmente o desde ventas
  @Post('descontar')
  descontar(@Body() body: { productoId: string; cantidad: number }[]) {
    return this.service.descontarStock(body);
  }

  // 🔥 NUEVO: Para que el botón "GUARDAR" del Modal de Edición funcione
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}