import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LabelRepository } from "../../domain/model/label.repository";
import { LabelDocument } from "../../domain/model/label.schema";
import {
  LabelCreateEntitySchema,
  LabelEntity,
  LabelUpdateEntitySchema,
} from "../../domain/model/label.entity";
import { LabelId } from "../../domain/model/label-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { LabelTitle } from "../../domain/model/label-title.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class LabelRepositoryImpl implements LabelRepository {
  constructor(
    @InjectModel(LabelEntity.name)
    private readonly labelModel: Model<LabelDocument>,
  ) {}

  public async save(schema: LabelCreateEntitySchema): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.labelModel.create(
      [{ title: schema.getTitle.raw, owner: schema.getOwner.raw }],
      { session },
    );
  }

  public async findAll(owner: UserId): Promise<LabelDocument[]> {
    return this.labelModel.find({ owner: owner.raw }).exec();
  }

  public async findById(id: LabelId, owner: UserId): Promise<LabelDocument> {
    const found = await this.labelModel
      .findOne({ _id: id.raw, owner: owner.raw })
      .exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 라벨을 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found;
  }

  public async findByTitle(
    title: LabelTitle,
    owner: UserId,
  ): Promise<LabelDocument | null> {
    return this.labelModel
      .findOne({ title: title.raw, owner: owner.raw })
      .exec();
  }

  public async updateTitle(
    id: LabelId,
    schema: LabelUpdateEntitySchema,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.labelModel.findOneAndUpdate(
      { _id: id.raw, owner: schema.getOwner.raw },
      { $set: { title: schema.getTitle.raw } },
      { session },
    );
  }

  public async deleteOne(id: LabelId, owner: UserId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.labelModel.deleteOne(
      { _id: id.raw, owner: owner.raw },
      { session },
    );
  }
}
