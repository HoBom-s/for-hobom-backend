import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProjectLabelRepository } from "../../domain/repositories/project-label.repository";
import { ProjectLabelDocument } from "../../domain/model/project-label.schema";
import {
  CreateProjectLabelEntity,
  ProjectLabelEntity,
} from "../../domain/model/project-label.entity";
import { ProjectLabelId } from "../../domain/model/project-label-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class ProjectLabelRepositoryImpl implements ProjectLabelRepository {
  constructor(
    @InjectModel(ProjectLabelEntity.name)
    private readonly projectLabelModel: Model<ProjectLabelDocument>,
  ) {}

  public async save(entity: CreateProjectLabelEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.projectLabelModel.create(
      [
        {
          project: entity.getProject.raw,
          name: entity.getName,
          color: entity.getColor,
        },
      ],
      { session },
    );
  }

  public async findByProject(
    projectId: ProjectId,
  ): Promise<ProjectLabelDocument[]> {
    return (await this.projectLabelModel
      .find({ project: projectId.raw })
      .lean()
      .exec()) as unknown as ProjectLabelDocument[];
  }

  public async findById(id: ProjectLabelId): Promise<ProjectLabelDocument> {
    const found = await this.projectLabelModel
      .findOne({ _id: id.raw })
      .lean()
      .exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 프로젝트 라벨을 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found as unknown as ProjectLabelDocument;
  }

  public async update(
    id: ProjectLabelId,
    data: Record<string, unknown>,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.projectLabelModel.findOneAndUpdate(
      { _id: id.raw },
      { $set: data },
      { session },
    );
  }

  public async deleteOne(id: ProjectLabelId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.projectLabelModel.deleteOne({ _id: id.raw }, { session });
  }

  public async deleteByProject(projectId: ProjectId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.projectLabelModel.deleteMany(
      { project: projectId.raw },
      { session },
    );
  }
}
