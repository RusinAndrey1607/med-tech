import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsController } from './notifications.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'notifications' }),RealtimeModule],
  providers: [NotificationsService, NotificationsProcessor],
  controllers: [NotificationsController]
})
export class NotificationsModule { }
