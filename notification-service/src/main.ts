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
          brokers: (
            process.env.KAFKA_BROKERS ?? 'localhost:9094'
          ).split(','),
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