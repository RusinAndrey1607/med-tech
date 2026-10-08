import {
    Injectable,
} from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { NotificationJobName } from './enum/notification-job-name.enum';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('notifications')
        private readonly notificationsQueue: Queue,
    ) { }

    async createAppointmentCreatedNotification(
        eventId: string,
        appointmentId: string,
    ) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    eventId,
                    appointmentId,
                    type: NotificationType.APPOINTMENT_CREATED,
                    title: 'Запись создана',
                    message: 'Ваша запись успешно создана',
                },
            });

            return notification;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                return this.prisma.notification.findUnique({
                    where: {
                        eventId,
                    },
                });
            }

            throw error;
        }
    }
    async createTestDuplicateJob(
        eventId: string,
        appointmentId: string,
    ) {
        await this.notificationsQueue.add(
            NotificationJobName.APPOINTMENT_CREATED,
            {
                appointmentId,
            },
            {
                jobId: eventId,
            },
        );
    }
}