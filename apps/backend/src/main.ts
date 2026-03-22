import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // elimina campos extra
    forbidNonWhitelisted: true, // error si mandan cosas raras
    transform: true, // convierte tipos
  }));

  await app.listen(3000);
}
bootstrap();
