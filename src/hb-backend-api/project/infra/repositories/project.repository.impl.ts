import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProjectRepository } from "../../domain/repositories/project.repository";
import { ProjectDocument } from "../../domain/model/project.schema";
import {
  CreateProjectEntity,
  ProjectEntity,
} from "../../domain/model/project.entity";
import { ProjectId } from "../../domain/model/project-id.vo";
import { ProjectKey } from "../../domain/model/project-key.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { MemberRole } from "../../domain/enums/member-role.enum";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class ProjectRepositoryImpl implements ProjectRepository {
  constructor(
    @InjectModel(ProjectEntity.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  public async save(entity: CreateProjectEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.projectModel.create(
      [
        {
          key: entity.getKey.raw,
          name: entity.getName,
          description: entity.getDescription,
          owner: entity.getOwner.raw,
          members: [
            {
              userId: entity.getOwner.raw,
              role: MemberRole.ADMIN,
              joinedAt: new Date(),
            },
          ],
          issueSequence: 0,
          workflow: entity.getWorkflow,
          issueTypes: entity.getIssueTypes,
          priorities: entity.getPriorities,
        },
      ],
      { session },
    );
  }

  public async findById(id: ProjectId): Promise<ProjectDocument> {
    const found = await this.projectModel.findOne({ _id: id.raw }).exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 프로젝트를 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found;
  }

  public async findByKey(key: ProjectKey): Promise<ProjectDocument | null> {
    return this.projectModel.findOne({ key: key.raw }).exec();
  }

  public async findByOwner(owner: UserId): Promise<ProjectDocument[]> {
    return this.projectModel.find({ owner: owner.raw }).exec();
  }

  public async findByMember(userId: UserId): Promise<ProjectDocument[]> {
    return this.projectModel.find({ "members.userId": userId.raw }).exec();
  }

  public async update(
    id: ProjectId,
    data: Record<string, unknown>,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.projectModel.findOneAndUpdate(
      { _id: id.raw },
      { $set: data },
      { session },
    );
  }

  public async incrementIssueSequence(id: ProjectId): Promise<number> {
    const session = MongoSessionContext.getSession();
    const updated = await this.projectModel.findOneAndUpdate(
      { _id: id.raw },
      { $inc: { issueSequence: 1 } },
      { new: true, session },
    );
    if (updated == null) {
      throw new NotFoundException(
        `해당 프로젝트를 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return updated.issueSequence;
  }

  public async addMember(
    id: ProjectId,
    userId: UserId,
    role: MemberRole,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.projectModel.findOneAndUpdate(
      { _id: id.raw },
      {
        $push: {
          members: {
            userId: userId.raw,
            role,
            joinedAt: new Date(),
          },
        },
      },
      { session },
    );
  }

  public async removeMember(id: ProjectId, userId: UserId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.projectModel.findOneAndUpdate(
      { _id: id.raw },
      { $pull: { members: { userId: userId.raw } } },
      { session },
    );
  }

  public async deleteOne(id: ProjectId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.projectModel.deleteOne({ _id: id.raw }, { session });
  }
}
