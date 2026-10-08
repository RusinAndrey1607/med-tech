import {
    Controller,
    MessageEvent,
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
    notifications(): Observable<MessageEvent> {
        
        return this.realtimeService.subscribe().pipe(
            map((event: RealtimeEvent) => ({
                type: event.type,
                data: event.data,
            })),
        );
    }
}