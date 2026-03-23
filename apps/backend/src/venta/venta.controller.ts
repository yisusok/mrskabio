import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { VentaService } from './venta.service';
import { Venta } from './venta.entity';

@Controller('venta')
export class VentaController {
  constructor(private readonly service: VentaService) {}

  @Post()
  create(
    @Body()
    body: {
      metodoPago: string;
      items: { productoId: string; cantidad: number }[];
    },
  ): Promise<Venta> {
    return this.service.createVenta(body);
  }

  // 🔥 ENDPOINT PARA REPORTES
  @Get('reporte')
  getReporte(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.service.getVentasPorRango(desde, hasta);
  }
}