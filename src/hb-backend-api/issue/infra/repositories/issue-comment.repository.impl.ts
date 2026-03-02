import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IssueCommentRepository } from "../../domain/repositories/issue-comment.repository";
import { IssueCommentDocument } from "../../domain/model/issue-comment.schema";
import {
  CreateIssueCommentEntity,
  IssueCommentEntity,
} from "../../domain/model/issue-comment.entity";
import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";
import { IssueId } from "../../domain/model/issue-id.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class IssueCommentRepositoryImpl implements IssueCommentRepository {
  constructor(
    @InjectModel(IssueCommentEntity.name)
    private readonly issueCommentModel: Model<IssueCommentDocument>,
  ) {}

  public async save(entity: CreateIssueCommentEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.issueCommentModel.create(
      [
        {
          issue: entity.getIssue.raw,
          project: entity.getProject.raw,
          author: entity.getAuthor.raw,
          body: entity.getBody,
        },
      ],
      { session },
    );
  }

  public async findByIssue(issueId: IssueId): Promise<IssueCommentDocument[]> {
    return this.issueCommentModel
      .find({ issue: issueId.raw, deletedAt: null })
      .sort({ createdAt: 1 })
      .exec();
  }

  public async findById(id: IssueCommentId): Promise<IssueCommentDocument> {
    const found = await this.issueCommentModel
      .findOne({ _id: id.raw, deletedAt: null })
      .exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 댓글을 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found;
  }

  public async update(
    id: IssueCommentId,
    data: Record<string, unknown>,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.issueCommentModel.findOneAndUpdate(
      { _id: id.raw },
      { $set: { ...data, editedAt: new Date() } },
      { session },
    );
  }

  public async softDelete(id: IssueCommentId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.issueCommentModel.findOneAndUpdate(
      { _id: id.raw },
      { $set: { deletedAt: new Date() } },
      { session },
    );
  }
}
