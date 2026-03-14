import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IssueHistoryRepository } from "../../domain/repositories/issue-history.repository";
import { IssueHistoryDocument } from "../../domain/model/issue-history.schema";
import {
  CreateIssueHistoryEntity,
  IssueHistoryEntity,
} from "../../domain/model/issue-history.entity";
import { IssueId } from "../../domain/model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class IssueHistoryRepositoryImpl implements IssueHistoryRepository {
  constructor(
    @InjectModel(IssueHistoryEntity.name)
    private readonly issueHistoryModel: Model<IssueHistoryDocument>,
  ) {}

  public async save(entity: CreateIssueHistoryEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.issueHistoryModel.create(
      [
        {
          issue: entity.getIssue.raw,
          project: entity.getProject.raw,
          actor: entity.getActor.raw,
          action: entity.getAction,
          changes: entity.getChanges,
        },
      ],
      { session },
    );
  }

  public async findByIssue(issueId: IssueId): Promise<IssueHistoryDocument[]> {
    return (await this.issueHistoryModel
      .find({ issue: issueId.raw })
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown as IssueHistoryDocument[];
  }

  public async findByProject(
    projectId: ProjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<IssueHistoryDocument[]> {
    return (await this.issueHistoryModel
      .find({
        project: projectId.raw,
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown as IssueHistoryDocument[];
  }

  public async deleteByProject(projectId: ProjectId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.issueHistoryModel.deleteMany(
      { project: projectId.raw },
      { session },
    );
  }
}
