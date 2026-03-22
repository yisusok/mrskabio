import { IsString, IsNumber, IsOptional, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateProductoDto {

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsNumber()
  @IsPositive()
  precio!: number;

  @IsNumber()
  @IsPositive()
  stock!: number;

  @IsOptional()
  @IsString()
  codigoBarras?: string;
}