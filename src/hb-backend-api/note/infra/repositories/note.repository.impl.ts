import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NoteRepository } from "../../domain/model/note.repository";
import { NoteDocument } from "../../domain/model/note.schema";
import {
  NoteCreateEntitySchema,
  NoteEntity,
} from "../../domain/model/note.entity";
import { NoteId } from "../../domain/model/note-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../../domain/enums/note-status.enum";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class NoteRepositoryImpl implements NoteRepository {
  constructor(
    @InjectModel(NoteEntity.name)
    private readonly noteModel: Model<NoteDocument>,
  ) {}

  public async save(schema: NoteCreateEntitySchema): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.noteModel.create(
      [
        {
          owner: schema.getOwner.raw,
          title: schema.getTitle ?? undefined,
          content: schema.getContent ?? undefined,
          type: schema.getType,
          checklistItems: schema.getChecklistItems.map((i) => i.toPlain()),
          color: schema.getColor.raw,
          labels: schema.getLabels.map((l) => l.raw),
          reminder: schema.getReminder?.toPlain() ?? undefined,
          order: schema.getOrder,
        },
      ],
      { session },
    );
  }

  public async findById(id: NoteId, userId: UserId): Promise<NoteDocument> {
    const found = await this.noteModel
      .findOne({
        _id: id.raw,
        $or: [{ owner: userId.raw }, { members: userId.raw }],
      })
      .lean()
      .exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 노트를 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found as unknown as NoteDocument;
  }

  public async findAll(
    userId: UserId,
    status: NoteStatus,
  ): Promise<NoteDocument[]> {
    return (await this.noteModel
      .find({
        $or: [{ owner: userId.raw }, { members: userId.raw }],
        status,
      })
      .sort({ isPinned: -1, order: 1 })
      .lean()
      .exec()) as unknown as NoteDocument[];
  }

  public async update(
    id: NoteId,
    userId: UserId,
    data: Record<string, unknown>,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.noteModel.findOneAndUpdate(
      {
        _id: id.raw,
        $or: [{ owner: userId.raw }, { members: userId.raw }],
      },
      { $set: data },
      { session },
    );
  }

  public async deleteOne(id: NoteId, owner: UserId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.noteModel.deleteOne(
      { _id: id.raw, owner: owner.raw },
      { session },
    );
  }

  public async deleteAllTrashed(owner: UserId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.noteModel.deleteMany(
      { owner: owner.raw, status: NoteStatus.TRASHED },
      { session },
    );
  }

  public async deleteTrashedBefore(threshold: Date): Promise<number> {
    const session = MongoSessionContext.getSession();
    const result = await this.noteModel.deleteMany(
      { status: NoteStatus.TRASHED, trashedAt: { $lte: threshold } },
      { session },
    );
    return result.deletedCount;
  }

  public async findMinOrder(userId: UserId): Promise<number> {
    const result = await this.noteModel
      .findOne({
        $or: [{ owner: userId.raw }, { members: userId.raw }],
      })
      .sort({ order: 1 })
      .select("order")
      .lean()
      .exec();
    return result?.order ?? 0;
  }

  public async addMember(id: NoteId, memberUserId: UserId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.noteModel.findOneAndUpdate(
      { _id: id.raw },
      { $push: { members: memberUserId.raw } },
      { session },
    );
  }

  public async removeMember(id: NoteId, memberUserId: UserId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.noteModel.findOneAndUpdate(
      { _id: id.raw },
      { $pull: { members: memberUserId.raw } },
      { session },
    );
  }
}
