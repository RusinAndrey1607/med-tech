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

@Module({
  imports: [HealthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    ClinicsModule,
    PatientsModule,
    AppointmentsModule,
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
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
