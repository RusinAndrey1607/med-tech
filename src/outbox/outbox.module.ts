import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { BullModule } from '@nestjs/bullmq';
import { OutboxProcessor } from './outbox.processor';

@Module({
  imports: [
    BullModule.registerQueue({
    name: 'notifications',
  }),],
  providers: [OutboxService,OutboxProcessor],

})
export class OutboxModule { }
