import { Inject, Injectable } from "@nestjs/common";
import { FindLogOutboxByEventTypeAndStatusUseCase } from "../../domain/ports/in/find-log-outbox-by-event-type-and-status.use-case";
import { EventType } from "../../domain/model/event-type.enum";
import { OutboxStatus } from "../../domain/model/outbox-status.enum";
import { FindOutboxLogQueryResult } from "../../domain/ports/out/find-outbox-log-query.result";
import { DIToken } from "../../../../shared/di/token.di";
import { OutboxQueryPort } from "../../domain/ports/out/outbox-query.port";
import { FindOutboxEntity } from "../../domain/model/find-outbox.entity";

@Injectable()
export class FindLogOutboxByEventTypeAndStatusService
  implements FindLogOutboxByEventTypeAndStatusUseCase
{
  constructor(
    @Inject(DIToken.OutboxModule.OutboxQueryPort)
    private readonly outboxQueryPort: OutboxQueryPort,
  ) {}

  public async invoke(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxLogQueryResult[]> {
    const outboxResults = await this.getBy(eventType, status);

    return this.toResult(outboxResults);
  }

  private async getBy(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxEntity[]> {
    return await this.outboxQueryPort.findByEventTypeAndStatus(
      eventType,
      status,
    );
  }

  private toResult(outbox: FindOutboxEntity[]): FindOutboxLogQueryResult[] {
    return outbox.map(FindOutboxLogQueryResult.from);
  }
}
