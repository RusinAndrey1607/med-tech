import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { type AuditEvent, AuditService } from './audit.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly auditService: AuditService) {}

  @EventPattern('appointment-events')
  async handleAppointmentEvent(
    @Payload() event: AuditEvent,
    @Ctx() context: unknown ,
  ) {
    const result = await this.auditService.record(event);
    const kafkaContext = context as KafkaContext
    this.logger.log(
      `eventId=${event.eventId}, topic=${kafkaContext.getTopic()}, recorded=${result.recorded}`,
    );
  }
}