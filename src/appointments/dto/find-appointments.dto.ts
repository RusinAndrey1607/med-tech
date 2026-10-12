import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class AppointmentsQueryDto {
  @ApiPropertyOptional({
    example: '',
    description: 'Фильтр по клинике',
  })
  @IsOptional()
  @IsString()
  clinicId?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Фильтр по пациенту',
  })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({
    example: 'scheduled',
    enum: ['scheduled', 'completed', 'cancelled'],
    description: 'Фильтр по статусу',
  })
  @IsOptional()
  @IsIn(['scheduled', 'completed', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Фильтр по дате',
    format: 'date',
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Номер страницы',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    type: Number,
    example: 10,
    default: 10,
    minimum: 1,
    description: 'Количество записей на странице',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}