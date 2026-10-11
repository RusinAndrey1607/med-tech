import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'notification-service',
          brokers: ['localhost:9094'],
        },
        consumer: {
          groupId: 'notification-service-group',
        },
      },
    },
  );

  await app.listen();
  console.log('Notification service connected to Kafka');
}

bootstrap();