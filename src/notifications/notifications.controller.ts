import {
    Controller,
    Param,
    Post,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
    ) { }

    @Post('test/duplicate/:eventId/:appointmentId')
    async duplicate(
        @Param('eventId') eventId: string,
        @Param('appointmentId') appointmentId: string,
    ) {
        return this.notificationsService.createTestDuplicateJob(
            eventId,
            appointmentId,
        );
    }
}