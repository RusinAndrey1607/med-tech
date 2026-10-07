import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';

@Controller('clinics')
export class ClinicsController {
    constructor(private readonly clinicsService: ClinicsService) { }

    @Get()
    findAll() {
        return this.clinicsService.findAll();
    }

    @Post()
    create(@Body() dto: CreateClinicDto) {
        return this.clinicsService.create(dto);
    }

    @Get(':id/patients')
    findPatients(@Param('id') id: string) {
        return this.clinicsService.findPatients(id);
    }
}
