import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientsService } from './patients.service';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    // CREATE
    @Post()
    create(@Body() dto: CreatePatientDto) {
        return this.patientsService.create(dto);
    }
    // READ
    @Get()
    findAll() {
        return this.patientsService.findAll();
    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.patientsService.findOne(id);
    }
    // UPDATE
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdatePatientDto,
    ) {
        return this.patientsService.update(id, dto);
    }
    // DELETE
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.patientsService.remove(id);
    }
}