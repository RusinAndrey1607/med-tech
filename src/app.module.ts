import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthModule } from './health/health.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { ClinicsModule } from './clinics/clinics.module.js';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CacheModule } from '@nestjs/cache-manager';
import { KeyvCacheableMemory } from 'cacheable';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { RedisModule } from './redis/redis.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OutboxModule } from './outbox/outbox.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { RealtimeModule } from './realtime/realtime.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KafkaModule } from './kafka/kafka.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow<string>('REDIS_URL'),
        },
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('REDIS_URL');

        return {
          stores: [
            new Keyv({
              store: new KeyvCacheableMemory({
                ttl: 60_000,
                lruSize: 5000,
              }),
            }),

            createKeyv(redisUrl),
          ],
        };
      },
    }),
    HealthModule,

    PrismaModule,
    ClinicsModule,
    PatientsModule,
    AppointmentsModule,


    RedisModule,
    NotificationsModule,
    OutboxModule,
    RealtimeModule,
    AuthModule,
    UsersModule,
    KafkaModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
