import { Inject, Injectable } from "@nestjs/common";
import { EventType } from "../../domain/enum/event-type.enum";
import { OutboxStatus } from "../../domain/enum/outbox-status.enum";
import { FindOutboxByEventTypeAndStatusUseCase } from "../ports/in/find-outbox-by-event-type-and-status.use-case";
import { FindOutboxQueryResult } from "../result/find-outbox-query.result";
import { FindOutboxEntity } from "../../domain/entity/find-outbox.entity";
import { DIToken } from "../../../../shared/di/token.di";
import { OutboxQueryPort } from "../ports/out/outbox-query.port";

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
  ): Promise<FindOutboxQueryResult[]> {
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

  private toResult(outbox: FindOutboxEntity[]): FindOutboxQueryResult[] {
    return outbox.map(FindOutboxQueryResult.from);
  }
}
