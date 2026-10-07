import { IsIn, IsString } from 'class-validator';

export class UpdateAppointmentDto {
  @IsString()
  @IsIn(['scheduled', 'completed', 'cancelled'])
  status: string;
}