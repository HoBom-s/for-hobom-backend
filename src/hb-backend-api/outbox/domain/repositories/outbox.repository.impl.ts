import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OutboxRepository } from "../../infra/repositories/outbox.repository";
import { OutboxEntity } from "../entity/outbox.entity";
import { OutboxDocument } from "../entity/outbox.schema";
import { CreateOutboxEntity } from "../entity/create-outbox.entity";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";
import { EventType } from "../enum/event-type.enum";
import { OutboxStatus } from "../enum/outbox-status.enum";

@Injectable()
export class OutboxRepositoryImpl implements OutboxRepository {
  constructor(
    @InjectModel(OutboxEntity.name)
    private readonly outboxModel: Model<OutboxDocument>,
  ) {}

  public async save(entity: CreateOutboxEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.outboxModel.create(
      [
        {
          eventType: entity.getEventType,
          payload: entity.getPayload,
          status: entity.getStatus,
          retryCount: entity.getRetryCount,
          sentAt: null,
          failedAt: null,
          lastError: null,
          version: entity.getVersion,
        },
      ],
      {
        session: session,
      },
    );
  }

  public async findByEventTypeAndStatus(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<OutboxDocument[]> {
    const outbox = await this.outboxModel
      .find({
        eventType,
        status,
      })
      .exec();
    if (outbox == null) {
      return [];
    }

    return outbox;
  }
}
