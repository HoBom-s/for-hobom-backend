import { Inject, Injectable } from "@nestjs/common";
import { ProjectLabelQueryPort } from "../../ports/out/project-label-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectLabelRepository } from "../../domain/repositories/project-label.repository";
import { ProjectLabelDocument } from "../../domain/model/project-label.schema";
import { ProjectLabelId } from "../../domain/model/project-label-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

@Injectable()
export class ProjectLabelQueryAdapter implements ProjectLabelQueryPort {
  constructor(
    @Inject(DIToken.ProjectLabelModule.ProjectLabelRepository)
    private readonly projectLabelRepository: ProjectLabelRepository,
  ) {}

  public async findByProject(
    projectId: ProjectId,
  ): Promise<ProjectLabelDocument[]> {
    return this.projectLabelRepository.findByProject(projectId);
  }

  public async findById(id: ProjectLabelId): Promise<ProjectLabelDocument> {
    return this.projectLabelRepository.findById(id);
  }
}
