import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool } from 'pg';

export interface AuditEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt?: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class AuditService implements OnModuleInit, OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  async onModuleInit() {

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS audit_events (
        id BIGSERIAL PRIMARY KEY,
        event_id VARCHAR(255) NOT NULL UNIQUE,
        event_type VARCHAR(255) NOT NULL,
        aggregate_id VARCHAR(255) NOT NULL,
        occurred_at TIMESTAMPTZ,
        received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        payload JSONB NOT NULL
      )
    `);
  }

  async record(event: AuditEvent) {
    const result = await this.pool.query(
      `
        INSERT INTO audit_events (
          event_id,
          event_type,
          aggregate_id,
          occurred_at,
          payload
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
      `,
      [
        event.eventId,
        event.eventType,
        event.aggregateId,
        event.occurredAt ?? null,
        JSON.stringify(event.payload),
      ],
    );

    if (result.rowCount === 0) {
      return { recorded: false, reason: 'duplicate' };
    }

    return { recorded: true };
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}