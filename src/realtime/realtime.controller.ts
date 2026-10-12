import {
    Controller,
    MessageEvent,
    Query,
    Sse,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiProduces,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    RealtimeEvent,
    RealtimeService,
} from './realtime.service';

@ApiTags('Realtime')
@Controller('realtime')
export class RealtimeController {
    constructor(
        private readonly realtimeService: RealtimeService,
    ) { }

    @Sse('notifications')
    @ApiOperation({
        summary: 'Получить поток уведомлений пациента',
        description: 'Открывает SSE-соединение и передаёт уведомления по мере их поступления.',
    })
    @ApiQuery({
        name: 'patientId',
        required: true,
        type: String,
        description: 'UUID пациента',
    })
    @ApiProduces('text/event-stream')
    @ApiResponse({
        status: 200,
        description: 'Поток событий SSE',
        content: {
            'text/event-stream': {
                schema: {
                    type: 'string',
                    example: 'data: {"type":"appointment.created","data":{"id":"123"}}\n\n',
                },
            },
        },
    })
    notifications(
        @Query('patientId') patientId: string,
    ): Observable<MessageEvent> {
        return this.realtimeService.subscribe(patientId).pipe(
            map((event: RealtimeEvent) => ({
                type: event.type,
                data: event.data,
            })),
        );
    }

}