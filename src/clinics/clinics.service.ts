import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicDto } from './dto/create-clinic.dto';

@Injectable()
export class ClinicsService {
    constructor(
        private readonly prisma:PrismaService
    ){}

 
  findAll() {
    return this.prisma.clinic.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  findPatients(clinicId:string){
    return this.prisma.patient.findMany({
      where:{
        clinicId
      },
    })
  }
  create(dto: CreateClinicDto) {
    return this.prisma.clinic.create({
      data: {
        ...dto
      },
    });
  }
}
