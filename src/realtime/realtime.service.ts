import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface RealtimeEvent {
  type: string;
  patientId: string;
  data: string | object;
}

@Injectable()
export class RealtimeService {
  private readonly events$ = new Subject<RealtimeEvent>();

  emit(event: RealtimeEvent) {
    this.events$.next(event);
  }

  subscribe(patientId: string) {
    return this.events$.asObservable().pipe(
      filter((event) => event.patientId === patientId),
    );
  }
}