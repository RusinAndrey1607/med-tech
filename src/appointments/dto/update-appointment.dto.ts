import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentDto {
  @ApiProperty({
    example: 'completed',
    enum: ['scheduled', 'completed', 'cancelled'],
    description: 'Новый статус записи',
  })
  @IsString()
  @IsIn(['scheduled', 'completed', 'cancelled'])
  status: string;
}