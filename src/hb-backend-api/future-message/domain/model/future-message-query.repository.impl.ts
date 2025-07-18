import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FutureMessageQueryRepository } from "../../infra/repositorries/future-message-query.repository";
import { FutureMessageEntity } from "./future-message.entity";
import { FutureMessageDocument } from "./future-message.schema";
import { FutureMessageDomain } from "./future-message.domain";
import { SendStatus } from "./send-status.enum";
import { FutureMessageId } from "./future-message-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Injectable()
export class FutureMessageQueryRepositoryImpl
  implements FutureMessageQueryRepository
{
  constructor(
    @InjectModel(FutureMessageEntity.name)
    private readonly futureMessageModel: Model<FutureMessageDocument>,
  ) {}

  public async findAllBySendStatus(
    sendStatus: SendStatus,
    senderId: UserId,
  ): Promise<FutureMessageDomain[]> {
    const foundItems = await this.futureMessageModel
      .find({
        sendStatus: sendStatus,
        senderId: senderId.raw,
      })
      .exec();

    return foundItems.map((found) =>
      FutureMessageDomain.of(
        FutureMessageId.fromString(found.id),
        UserId.fromString(found.senderId),
        UserId.fromString(found.recipientId),
        found.title,
        found.content,
        found.sendStatus,
        found.scheduledAt,
        found.createdAt,
        found.updatedAt,
      ),
    );
  }

  public async findById(id: FutureMessageId): Promise<FutureMessageDomain> {
    const found = await this.futureMessageModel.findById(id.raw).exec();
    if (found == null) {
      throw new NotFoundException(
        `FutureMessage 를 찾을 수 없어요. ${id.raw.toHexString()}`,
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
}
