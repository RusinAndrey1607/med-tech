import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaTestController } from './kafka-test.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: process.env.KAFKA_CLIENT_ID || 'med-tech-api',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9094').split(','),
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [KafkaTestController],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}