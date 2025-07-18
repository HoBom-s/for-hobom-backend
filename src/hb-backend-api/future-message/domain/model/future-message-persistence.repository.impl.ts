import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FutureMessagePersistenceRepository } from "../../infra/repositorries/future-message-persistence.repository";
import { FutureMessageEntity } from "./future-message.entity";
import { FutureMessageDomain } from "./future-message.domain";
import { FutureMessageId } from "./future-message-id.vo";
import { FutureMessageDocument } from "./future-message.schema";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { CreateFutureMessageEntity } from "./create-future-message.entity";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class FutureMessagePersistenceRepositoryImpl
  implements FutureMessagePersistenceRepository
{
  constructor(
    @InjectModel(FutureMessageEntity.name)
    private readonly futureMessageModel: Model<FutureMessageDocument>,
  ) {}

  public async load(id: FutureMessageId): Promise<FutureMessageDomain> {
    const found = await this.futureMessageModel.findById(id.raw).exec();
    if (found == null) {
      throw new NotFoundException(
        `FutureMessage 에 해당하는 EntityModel 을 찾을 수 없어요. ${id.raw.toHexString()}`,
      );
    }

    return FutureMessageDomain.of(
      FutureMessageId.fromString(found.id),
      UserId.fromString(found.senderId),
      UserId.fromString(found.recipientId),
      found.title,
      found.content,
      found.sendStatus,
      found.scheduledAt,
      found.createdAt,
      found.updatedAt,
    );
  }

  public async save(entity: CreateFutureMessageEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.futureMessageModel.create(
      [
        {
          senderId: entity.getSenderId.raw,
          recipientId: entity.getRecipientId.raw,
          title: entity.getTitle,
          content: entity.getContent,
          sendStatus: entity.getSendStatus,
          scheduledAt: entity.getScheduledAt,
        },
      ],
      {
        session: session,
      },
    );
  }
}
