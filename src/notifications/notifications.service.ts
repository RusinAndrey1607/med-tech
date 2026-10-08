import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NotificationJobName } from './enum/notification-job-name.enum';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectQueue('notifications')
        private readonly notificationsQueue: Queue,
    ) {}

    async addAppointmentCreatedJob(
        appointmentId: string,
    ) {
        await this.notificationsQueue.add(
            NotificationJobName.APPOINTMENT_CREATED,
            {
                appointmentId,
            },
            {
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: 1000,
                removeOnFail: false,
            },
        );
    }
}