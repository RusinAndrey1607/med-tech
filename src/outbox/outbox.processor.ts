import {
    Injectable,
    Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { OutboxEventStatus } from '@prisma/client';
import { NotificationJobName } from '../notifications/enum/notification-job-name.enum';
import { OutboxService } from './outbox.service';

@Injectable()
export class OutboxProcessor {
    private readonly logger = new Logger(
        OutboxProcessor.name,
    );

    constructor(
        private readonly prisma: PrismaService,
        private readonly outboxService: OutboxService,

        @InjectQueue('notifications')
        private readonly notificationsQueue: Queue,
    ) { }
    private getNotificationJobName(
        type: string,
    ): NotificationJobName {
        switch (type) {
            case NotificationJobName.APPOINTMENT_CREATED:
                return NotificationJobName.APPOINTMENT_CREATED;

            default:
                throw new Error(
                    `Unsupported notification event type: ${type}`,
                );
        }
    }

    @Cron('*/5 * * * * *')
    async process() {

        const events =
            await this.outboxService.claimPendingEvents(100);

        if (events.length === 0) {
            return;
        }

        this.logger.log(
            `[OUTBOX] Claimed ${events.length} events`,
        );
        for (const event of events) {
            try {
                this.logger.log(
                    `[OUTBOX] Processing event=${event.id} type=${event.type}`,
                );
                const jobName = this.getNotificationJobName(
                    event.type,
                );
                await this.notificationsQueue.add(
                    jobName,
                    event.payload,
                    {
                        jobId: event.id,
                        attempts: 5,
                        backoff: {
                            type: 'exponential',
                            delay: 1000,
                        },
                        removeOnComplete: 1000,
                        removeOnFail: false,
                    },
                );
                this.logger.log(
                    `[QUEUE] Job added: name=${jobName}, jobId=${event.id}`,
                );
                await this.prisma.outboxEvent.update({
                    where: {
                        id: event.id,
                    },
                    data: {
                        status: OutboxEventStatus.PROCESSED,
                        processedAt: new Date(),
                    },
                });

                this.logger.log(
                    `Outbox event processed: ${event.id}`,
                );
            } catch (error) {
                this.logger.error(
                    `Failed to process outbox event: ${event.id}`,
                    error,
                );

                await this.prisma.outboxEvent.update({
                    where: {
                        id: event.id,
                    },
                    data: {
                        status: OutboxEventStatus.FAILED,
                        attempts: {
                            increment: 1,
                        },
                    },
                });
            }
        }
    }

    @Cron('*/30 * * * * *')
    async recover() {
        const result = await this.outboxService.recoverStuckEvents();

        if (result.count === 0) {
            return;
        }

        this.logger.warn(
            `[OUTBOX] Recovered ${result.count} stuck events`,
        );
    }
}