import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
    constructor(private readonly prisma: PrismaService) { }
    // CREATE
    create(dto: CreatePatientDto) {
        return this.prisma.patient.create({
            data: dto,
        });
    }
    async createForUser(userId: string, dto: CreatePatientDto) {
        const existingPatient = await this.prisma.patient.findUnique({
            where: { userId },
        });

        if (existingPatient) {
            throw new ConflictException(
                'This user already has a patient profile',
            );
        }

        const { firstName, lastName, phone, clinicId } = dto;

        return this.prisma.patient.create({
            data: {
                firstName,
                lastName,
                phone,
                clinic: {
                    connect: { id: clinicId },
                },
                user: {
                    connect: { id: userId },
                },
            },
        });
    }
    // READ
    findAll() {
        return this.prisma.patient.findMany();
    }
    async findOne(id: string) {
        const patient = await this.prisma.patient.findUnique({
            where: { id },
            include: {
                clinic: true,
            },
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        return patient;
    }
    // UPDATE
    async update(id: string, dto: UpdatePatientDto) {
        const patient = await this.prisma.patient.findUnique({
            where: { id },
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        return this.prisma.patient.update({
            where: { id },
            data: dto,
        });
    }
    // DELETE
    async remove(id: string) {
        const patient = await this.prisma.patient.findUnique({
            where: { id },
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        return this.prisma.patient.delete({
            where: { id },
        });
    }
}