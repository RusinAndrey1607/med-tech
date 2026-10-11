import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OutboxEventStatus } from '@prisma/client';

@Injectable()
export class OutboxService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }


    async claimPendingEvents(limit = 100) {
        return this.prisma.$queryRaw<
            {
                id: string;
                type: string;
                aggregateId: string;
                payload: unknown;
                createdAt: Date;
            }[]
        >`
        UPDATE "OutboxEvent"
        SET
            status = ${OutboxEventStatus.PROCESSING}::"OutboxEventStatus",
            "claimedAt" = NOW(),
            attempts = attempts + 1
        WHERE id IN (
            SELECT id
            FROM "OutboxEvent"
            WHERE status = ${OutboxEventStatus.PENDING}::"OutboxEventStatus"
            ORDER BY "createdAt" ASC
            FOR UPDATE SKIP LOCKED
            LIMIT ${limit}
        )
        RETURNING
            id,
            type,
            "aggregateId",
            payload,
            "createdAt";
    `;
    }

    async recoverStuckEvents() {
        return this.prisma.outboxEvent.updateMany({
            where: {
                status: OutboxEventStatus.PROCESSING,
                claimedAt: {
                    lt: new Date(Date.now() - 5 * 60 * 1000),
                },
            },
            data: {
                status: OutboxEventStatus.PENDING,
                claimedAt: null,
            },
        });
    }
}