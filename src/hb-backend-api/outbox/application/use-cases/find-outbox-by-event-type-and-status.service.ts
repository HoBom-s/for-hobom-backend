import { Inject, Injectable } from "@nestjs/common";
import { EventType } from "../../domain/model/event-type.enum";
import { OutboxStatus } from "../../domain/model/outbox-status.enum";
import { FindOutboxByEventTypeAndStatusUseCase } from "../../domain/ports/in/find-outbox-by-event-type-and-status.use-case";
import { FindOutboxMessageQueryResult } from "../../domain/ports/out/find-outbox-message-query.result";
import { FindOutboxEntity } from "../../domain/model/find-outbox.entity";
import { DIToken } from "../../../../shared/di/token.di";
import { OutboxQueryPort } from "../../domain/ports/out/outbox-query.port";

@Injectable()
export class FindOutboxByEventTypeAndStatusService
  implements FindOutboxByEventTypeAndStatusUseCase
{
  constructor(
    @Inject(DIToken.OutboxModule.OutboxQueryPort)
    private readonly outboxQueryPort: OutboxQueryPort,
  ) {}

  public async invoke(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxMessageQueryResult[]> {
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

  private toResult(outbox: FindOutboxEntity[]): FindOutboxMessageQueryResult[] {
    return outbox.map(FindOutboxMessageQueryResult.from);
  }
}
