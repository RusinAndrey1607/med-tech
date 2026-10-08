import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface RealtimeEvent {
  type: string;
  data: string | object;
}

@Injectable()
export class RealtimeService {
  private readonly events$ = new Subject<RealtimeEvent>();

  emit(event: RealtimeEvent) {

    this.events$.next(event);
  }

  subscribe() {
    return this.events$.asObservable();
  }
}