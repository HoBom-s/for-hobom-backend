import { Inject, Injectable } from "@nestjs/common";
import { FindLawOutboxByEventTypeAndStatusUseCase } from "../../domain/ports/in/find-law-outbox-by-event-type-and-status.use-case";
import { EventType } from "../../domain/model/event-type.enum";
import { OutboxStatus } from "../../domain/model/outbox-status.enum";
import { FindOutboxLawQueryResult } from "../../domain/ports/out/find-outbox-law-query.result";
import { DIToken } from "../../../../shared/di/token.di";
import { OutboxQueryPort } from "../../domain/ports/out/outbox-query.port";
import { FindOutboxEntity } from "../../domain/model/find-outbox.entity";

@Injectable()
export class FindLawOutboxByEventTypeAndStatusService
  implements FindLawOutboxByEventTypeAndStatusUseCase
{
  constructor(
    @Inject(DIToken.OutboxModule.OutboxQueryPort)
    private readonly outboxQueryPort: OutboxQueryPort,
  ) {}

  public async invoke(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxLawQueryResult[]> {
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

  private toResult(outbox: FindOutboxEntity[]): FindOutboxLawQueryResult[] {
    return outbox.map(FindOutboxLawQueryResult.from);
  }
}
