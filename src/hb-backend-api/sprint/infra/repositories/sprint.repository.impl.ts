import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SprintRepository } from "../../domain/repositories/sprint.repository";
import { SprintDocument } from "../../domain/model/sprint.schema";
import {
  CreateSprintEntity,
  SprintEntity,
} from "../../domain/model/sprint.entity";
import { SprintId } from "../../domain/model/sprint-id.vo";
import { SprintStatus } from "../../domain/enums/sprint-status.enum";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class SprintRepositoryImpl implements SprintRepository {
  constructor(
    @InjectModel(SprintEntity.name)
    private readonly sprintModel: Model<SprintDocument>,
  ) {}

  public async save(entity: CreateSprintEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.sprintModel.create(
      [
        {
          project: entity.getProject.raw,
          name: entity.getName,
          goal: entity.getGoal,
          startDate: entity.getStartDate,
          endDate: entity.getEndDate,
          createdBy: entity.getCreatedBy.raw,
        },
      ],
      { session },
    );
  }

  public async findById(id: SprintId): Promise<SprintDocument> {
    const found = await this.sprintModel.findOne({ _id: id.raw }).exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 스프린트를 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found;
  }

  public async findByProject(projectId: ProjectId): Promise<SprintDocument[]> {
    return this.sprintModel
      .find({ project: projectId.raw })
      .sort({ startDate: -1 })
      .exec();
  }

  public async findActiveSprint(
    projectId: ProjectId,
  ): Promise<SprintDocument | null> {
    return this.sprintModel
      .findOne({
        project: projectId.raw,
        status: SprintStatus.ACTIVE,
      })
      .exec();
  }

  public async update(
    id: SprintId,
    data: Record<string, unknown>,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.sprintModel.findOneAndUpdate(
      { _id: id.raw },
      { $set: data },
      { session },
    );
  }

  public async deleteOne(id: SprintId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.sprintModel.deleteOne({ _id: id.raw }, { session });
  }
}
