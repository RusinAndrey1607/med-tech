import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment, Prisma } from '@prisma/client';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentsQueryDto } from './dto/find-appointments.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { REDIS_CLIENT } from '../redis/redis.module';
import { Redis } from 'ioredis';
import { createHash } from 'crypto';

@Injectable()
export class AppointmentsService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
        @Inject(REDIS_CLIENT)
        private readonly redis: Redis,
    ) { }
    private getRequestHash(dto: CreateAppointmentDto): string {
        return createHash('sha256')
            .update(JSON.stringify(dto))
            .digest('hex');
    }
    private async getAppointmentsCacheVersion(): Promise<number> {
        const key = 'cache:appointments:version';

        const version = await this.redis.get(key);

        if (!version) {
            await this.redis.set(key, '1');

            return 1;
        }

        return Number(version);
    }
    private async invalidateAppointmentsCache(): Promise<void> {
        await this.redis.incr('cache:appointments:version');
    }
    private async getAppointmentsCacheKey(
        query: AppointmentsQueryDto,
    ): Promise<string> {
        const version = await this.getAppointmentsCacheVersion();

        const {
            clinicId,
            patientId,
            status,
            date,
            page = 1,
            limit = 10,
        } = query;

        return [
            'appointments',
            `v${version}`,
            `clinic:${clinicId ?? 'all'}`,
            `patient:${patientId ?? 'all'}`,
            `status:${status ?? 'all'}`,
            `date:${date ?? 'all'}`,
            `page:${page}`,
            `limit:${limit}`,
        ].join(':');
    }
    async create(
        dto: CreateAppointmentDto,
        idempotencyKey: string,
    ) {
        const requestHash = this.getRequestHash(dto);

        const existing = await this.prisma.idempotencyKey.findUnique({
            where: {
                key: idempotencyKey,
            },
        });

        if (existing) {
            if (existing.requestHash !== requestHash) {
                throw new ConflictException(
                    'Idempotency-Key was already used with another request',
                );
            }
            console.log(
                `[Idempotency] CACHE HIT key=${idempotencyKey} appointmentId=${(existing.responseBody as any).id}`,
            );
            return existing.responseBody;
        }

        try {
            const appointment = await this.prisma.$transaction(async (tx) => {
                const patient = await tx.patient.findUnique({
                    where: {
                        id: dto.patientId,
                    },
                });

                if (!patient) {
                    throw new NotFoundException('Patient not found');
                }

                if (patient.clinicId !== dto.clinicId) {
                    throw new BadRequestException(
                        'Patient does not belong to this clinic',
                    );
                }

                const appointment = await tx.appointment.create({
                    data: {
                        clinicId: dto.clinicId,
                        patientId: dto.patientId,
                        startsAt: new Date(dto.startsAt),
                        status: dto.status,
                    },
                });

                await tx.idempotencyKey.create({
                    data: {
                        key: idempotencyKey,
                        requestHash,
                        responseStatus: 201,
                        responseBody: appointment,
                        expiresAt: new Date(
                            Date.now() + 24 * 60 * 60 * 1000,
                        ),
                    },
                });
                console.log(
                    `[Idempotency] CREATED key=${idempotencyKey} appointmentId=${appointment.id}`,
                );
                return appointment;
            });

            await this.invalidateAppointmentsCache();

            return appointment;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                const target = error.meta?.target;

                if (
                    Array.isArray(target) &&
                    target.includes('key')
                ) {
                    const existing = await this.prisma.idempotencyKey.findUnique({
                        where: {
                            key: idempotencyKey,
                        },
                    });

                    if (existing) {
                        if (existing.requestHash !== requestHash) {
                            throw new ConflictException(
                                'Idempotency-Key was already used with another request',
                            );
                        }
                        console.log(
                            `[Idempotency] RACE HIT key=${idempotencyKey} appointmentId=${(existing.responseBody as any).id}`,
                        );
                        return existing.responseBody;
                    }
                }

                throw new ConflictException(
                    'Patient already has an appointment at this time',
                );
                
            }
            throw error;
        }
    }
    // Read
    async findAll(query: AppointmentsQueryDto) {
        const {
            clinicId,
            patientId,
            status,
            date,
            page = 1,
            limit = 10,
        } = query;

        const cacheKey = await this.getAppointmentsCacheKey(query);

        const cached = await this.cache.get(cacheKey);

        if (cached) {
            console.log(`[CACHE HIT] ${cacheKey}`);

            return cached;
        }

        console.log(`[CACHE MISS] ${cacheKey}]`);

        const where: Prisma.AppointmentWhereInput = {
            ...(clinicId && { clinicId }),
            ...(patientId && { patientId }),
            ...(status && { status }),
        };

        if (date) {
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23: 59: 59.999Z`);

            where.startsAt = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        const skip = (page - 1) * limit;

        const [appointments, total] = await Promise.all([
            this.prisma.appointment.findMany({
                where,
                include: {
                    clinic: true,
                    patient: true,
                },
                orderBy: {
                    startsAt: 'asc',
                },
                skip,
                take: limit,
            }),

            this.prisma.appointment.count({
                where,
            }),
        ]);

        const result = {
            data: appointments,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };

        await this.cache.set(cacheKey, result, 60_000);

        return result;
    }

    async findOne(id: string) {
        const appointment = await this.prisma.appointment.findUnique({
            where: {
                id,
            },
            include: {
                clinic: true,
                patient: true,
            },
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        return appointment;
    }

    // UPDATE
    async update(id: string, dto: UpdateAppointmentDto) {
        const appointment = await this.prisma.appointment.findUnique({
            where: {
                id,
            },
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }
        const updated = await this.prisma.appointment.update({
            where: {
                id,
            },
            data: {
                status: dto.status,
            },
            include: {
                clinic: true,
                patient: true,
            },
        });

        await this.invalidateAppointmentsCache();

        return updated;
    }
    // DELETE
    async remove(id: string) {
        const appointment = await this.prisma.appointment.findUnique({
            where: {
                id,
            },
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        const deleted = await this.prisma.appointment.delete({
            where: {
                id,
            },
        });

        await this.invalidateAppointmentsCache();
        return deleted
    }
}
