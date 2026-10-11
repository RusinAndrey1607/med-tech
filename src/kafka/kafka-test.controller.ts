import { Body, Controller, Post } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { KafkaProducerService } from './kafka-producer.service';

@Controller('kafka')
export class KafkaTestController {
  constructor(
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  @Post('test')
  async publishTestEvent(
    @Body() body: { appointmentId: string },
  ) {
    const event = {
      eventId: randomUUID(),
      type: 'AppointmentCreated',
      appointmentId: body.appointmentId,
      patientId: 'test-patient',
      startsAt: new Date().toISOString(),
    };

    await this.kafkaProducer.publishAppointmentCreated({
      eventId: event.eventId,
      appointmentId: event.appointmentId,
      patientId: event.patientId,
      startsAt: event.startsAt,
    });

    return {
      published: true,
      event,
    };
  }
}