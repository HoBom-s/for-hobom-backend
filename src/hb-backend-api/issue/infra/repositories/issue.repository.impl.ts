import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IssueRepository } from "../../domain/repositories/issue.repository";
import { IssueDocument } from "../../domain/model/issue.schema";
import {
  CreateIssueEntity,
  IssueEntity,
} from "../../domain/model/issue.entity";
import { IssueId } from "../../domain/model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { SprintId } from "../../../sprint/domain/model/sprint-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class IssueRepositoryImpl implements IssueRepository {
  constructor(
    @InjectModel(IssueEntity.name)
    private readonly issueModel: Model<IssueDocument>,
  ) {}

  public async save(entity: CreateIssueEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.issueModel.create(
      [
        {
          project: entity.getProject.raw,
          issueNumber: entity.getIssueNumber,
          issueKey: entity.getIssueKey,
          type: entity.getType,
          title: entity.getTitle,
          description: entity.getDescription,
          status: entity.getStatus,
          statusCategory: entity.getStatusCategory,
          priority: entity.getPriority,
          reporter: entity.getReporter.raw,
          assignee: entity.getAssignee?.raw ?? null,
          sprint: entity.getSprint,
          parent: entity.getParent,
          labels: entity.getLabels,
        },
      ],
      { session },
    );
  }

  public async findById(id: IssueId): Promise<IssueDocument> {
    const found = await this.issueModel
      .findOne({ _id: id.raw, archivedAt: null })
      .exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 이슈를 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found;
  }

  public async findByIssueKey(
    projectId: ProjectId,
    issueNumber: number,
  ): Promise<IssueDocument | null> {
    return this.issueModel
      .findOne({
        project: projectId.raw,
        issueNumber,
        archivedAt: null,
      })
      .exec();
  }

  public async findByProject(projectId: ProjectId): Promise<IssueDocument[]> {
    return this.issueModel
      .find({ project: projectId.raw, archivedAt: null })
      .sort({ backlogOrder: 1 })
      .exec();
  }

  public async findBySprint(sprintId: SprintId): Promise<IssueDocument[]> {
    return this.issueModel
      .find({ sprint: sprintId.raw, archivedAt: null })
      .sort({ boardOrder: 1 })
      .exec();
  }

  public async findByAssignee(userId: UserId): Promise<IssueDocument[]> {
    return this.issueModel
      .find({ assignee: userId.raw, archivedAt: null })
      .sort({ updatedAt: -1 })
      .exec();
  }

  public async findByParent(parentId: IssueId): Promise<IssueDocument[]> {
    return this.issueModel
      .find({ parent: parentId.raw, archivedAt: null })
      .exec();
  }

  public async update(
    id: IssueId,
    data: Record<string, unknown>,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.issueModel.findOneAndUpdate(
      { _id: id.raw },
      { $set: data },
      { session },
    );
  }

  public async deleteOne(id: IssueId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.issueModel.findOneAndUpdate(
      { _id: id.raw },
      { $set: { archivedAt: new Date() } },
      { session },
    );
  }
}
