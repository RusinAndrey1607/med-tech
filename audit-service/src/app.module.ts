import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '../.env',
    
  }),],
  controllers: [AppController],
  providers: [AuditService],
})
export class AppModule { }