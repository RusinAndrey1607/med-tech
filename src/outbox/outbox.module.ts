import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { OutboxService } from './outbox.service';
import { OutboxProcessor } from './outbox.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    ClientsModule.register([
      {
        name: 'AUDIT_KAFKA',
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
  providers: [OutboxService, OutboxProcessor],
  exports: [OutboxService],
})
export class OutboxModule { }
