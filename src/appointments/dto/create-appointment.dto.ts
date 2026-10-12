import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 'clinic-uuid',
    description: 'ID клиники',
  })
  @IsString()
  @IsNotEmpty()
  clinicId: string;

  @ApiProperty({
    example: 'patient-uuid',
    description: 'ID пациента',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    example: '2026-10-15T10:00:00.000Z',
    description: 'Дата и время начала приёма',
  })
  @IsDateString()
  startsAt: string;



  @ApiPropertyOptional({
    example: 'scheduled',
    enum: ['scheduled', 'completed', 'cancelled'],
    description: 'Статус записи',
    default: 'scheduled',
  })
  @IsOptional()
  @IsString()
  @IsIn(['scheduled', 'completed', 'cancelled'])
  status?: string;
}