import { IsArray, IsString } from 'class-validator';

export class CreateVentaDto {
  @IsString()
  metodoPago!: string;

  @IsArray()
  items!: {
    productoId: string;
    cantidad: number;
  }[];
}