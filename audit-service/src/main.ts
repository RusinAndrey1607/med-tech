import { NestFactory } from '@nestjs/core';
import {
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId:
              process.env.KAFKA_AUDIT_CLIENT_ID ?? 'audit-service',
            brokers: (
              process.env.KAFKA_BROKERS ?? 'localhost:9094'
            ).split(','),
          },
          consumer: {
            groupId:
              process.env.KAFKA_AUDIT_GROUP_ID ?? 'audit-service-group',
          },
        },
      },
    );

  await app.listen();
}

bootstrap();