import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OutboxRepository } from "../../infra/repositories/outbox.repository";
import { OutboxEntity } from "./outbox.entity";
import { OutboxDocument } from "./outbox.schema";
import { CreateOutboxEntity } from "./create-outbox.entity";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";
import { EventType } from "./event-type.enum";
import { OutboxStatus } from "./outbox-status.enum";
import { EventId } from "./event-id.vo";

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

  public async markAsSent(eventId: EventId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.outboxModel.updateOne(
      { eventId: eventId.raw },
      {
        $set: {
          status: OutboxStatus.SENT,
          sentAt: new Date(),
          lastError: null,
        },
        $inc: {
          version: 1,
        },
      },
      session,
    );
  }

  public async markAsFailed(
    eventId: EventId,
    errorMessage: string,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.outboxModel.updateOne(
      { eventId: eventId.raw },
      {
        $set: {
          status: OutboxStatus.FAILED,
          failedAt: new Date(),
          lastError: errorMessage,
        },
        $inc: {
          retryCount: 1,
          version: 1,
        },
      },
      session,
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

  public async deleteExpiredBatch(
    olderThan: Date,
    batchSize: number,
  ): Promise<number> {
    const docs = await this.outboxModel
      .find({ createdAt: { $lt: olderThan } })
      .limit(batchSize)
      .select("_id")
      .lean()
      .exec();
    if (docs.length === 0) return 0;

    const ids = docs.map((doc) => doc._id);
    const result = await this.outboxModel.deleteMany({ _id: { $in: ids } });
    return result.deletedCount;
  }
}
