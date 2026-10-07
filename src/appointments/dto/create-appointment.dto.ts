import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  clinicId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsDateString()
  startsAt: string;

  @IsOptional()
  @IsString()
  @IsIn(['scheduled', 'completed', 'cancelled'])
  status?: string;
}