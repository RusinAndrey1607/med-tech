import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateClinicDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;
}