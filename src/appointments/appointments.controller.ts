import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentsQueryDto } from './dto/find-appointments.dto';

@Controller('appointments')
export class AppointmentsController {
    constructor(
        private readonly appointmentsService: AppointmentsService,
    ) { }

    // CREATE
    @Post()
    create(
        @Headers('idempotency-key') idempotencyKey: string,
        @Body() dto: CreateAppointmentDto,
    ) {
        if (!idempotencyKey) {
            throw new BadRequestException(
                'Idempotency-Key header is required',
            );
        }
        return this.appointmentsService.create(dto, idempotencyKey);
    }
    // READ
    @Get()
    findAll(@Query() query: AppointmentsQueryDto) {
        return this.appointmentsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.appointmentsService.findOne(id);
    }

    // UPDATE
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateAppointmentDto,
    ) {
        return this.appointmentsService.update(id, dto);
    }
    // DELETE
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.appointmentsService.remove(id);
    }
}
