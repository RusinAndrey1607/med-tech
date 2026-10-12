import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3000);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Med-Tech API')
    .setDescription('API для управления клиникой, пациентами и записями на приём')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app as any, swaggerConfig);

  SwaggerModule.setup('api/docs', app as any, document);
  await app.listen(port);
}
bootstrap();
