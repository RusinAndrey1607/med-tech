import {
    Controller,
    MessageEvent,
    Query,
    Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    RealtimeEvent,
    RealtimeService,
} from './realtime.service';

@Controller('realtime')
export class RealtimeController {
    constructor(
        private readonly realtimeService: RealtimeService,
    ) { }

    @Sse('notifications')
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