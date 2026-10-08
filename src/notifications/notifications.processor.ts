import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationJobName } from './enum/notification-job-name.enum';
import { Logger } from '@nestjs/common';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
    private readonly logger = new Logger(
        NotificationsProcessor.name,
    );
    async process(job: Job) {
        this.logger.log(
            `[WORKER] Started: jobId=${job.id}, name=${job.name}, attempt=${job.attemptsMade + 1}`,
        );

        switch (job.name) {
            case NotificationJobName.APPOINTMENT_CREATED:
                await this.handleAppointmentCreated(job);
                break;

            default:
                throw new Error(
                    `Unknown job: ${job.name}`,
                );
        }
        this.logger.log(
            `[WORKER] Completed: jobId=${job.id}`,
        );
    }

    private async handleAppointmentCreated(
        job: Job,
    ) {
        const { appointmentId } = job.data;

         this.logger.log(
            `[NOTIFICATION] Appointment created: ${appointmentId}`,
        );

        // Здесь позже будет:
        // email
        // push
        // SSE
        // SMS
    }
}