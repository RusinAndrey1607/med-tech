import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

interface AppointmentCreatedEvent {
  eventId: string;
  appointmentId: string;
  patientId: string;
  startsAt: string;
}

@Controller()
export class AppController {
  @EventPattern('appointment-events')
  handleAppointmentCreated(
    @Payload() event: AppointmentCreatedEvent,
    @Ctx() context: unknown,
  ): void {
    const kafkaContext = context as KafkaContext;

    console.log('Received appointment event:', event);
    console.log('Topic:', kafkaContext.getTopic());
    console.log('Partition:', kafkaContext.getPartition());
    console.log('Offset:', kafkaContext.getMessage().offset);
  }
}