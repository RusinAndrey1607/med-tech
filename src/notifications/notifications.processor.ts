import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationJobName } from './enum/notification-job-name.enum';
import { Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RealtimeService } from '../realtime/realtime.service';
import { PrismaService } from '../prisma/prisma.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly realtimeService: RealtimeService,
        private readonly prisma: PrismaService,


    ) { super() }
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

        if (!job.id) {
            throw new Error('Notification job id is missing');
        }

        const notification =
            await this.notificationsService
                .createAppointmentCreatedNotification(
                    job.id,
                    appointmentId,
                );
        const appointment = await this.prisma.appointment.findUnique({
            where: {
                id: appointmentId,
            },
        });

        if (!appointment) {
            throw new Error(
                `Appointment not found: ${appointmentId}`,
            );
        }
        this.realtimeService.emit({
            type: NotificationJobName.APPOINTMENT_CREATED,
            patientId: appointment.patientId,

            data: {
                notificationId: notification?.id,
                appointmentId,
                title: notification?.title,
                message: notification?.message,
            },
        });
        this.logger.log(
            `[SSE] Event emitted: notification=${notification?.id}`,
        );
        this.logger.log(
            `[NOTIFICATION] Created: id=${notification?.id}, appointment=${appointmentId}`,
        );

        // Здесь позже будет:
        // email
        // push
        // SSE
        // SMS
    }
}