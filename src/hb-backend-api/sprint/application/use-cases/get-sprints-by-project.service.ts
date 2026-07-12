import { Inject, Injectable } from "@nestjs/common";
import { GetSprintsByProjectUseCase } from "../../ports/in/get-sprints-by-project.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { SprintQueryPort } from "../../ports/out/sprint-query.port";
import { SprintDocument } from "../../domain/model/sprint.schema";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

@Injectable()
export class GetSprintsByProjectService implements GetSprintsByProjectUseCase {
  constructor(
    @Inject(DIToken.SprintModule.SprintQueryPort)
    private readonly sprintQueryPort: SprintQueryPort,
  ) {}

  public async invoke(projectId: ProjectId): Promise<SprintDocument[]> {
    return this.sprintQueryPort.findByProject(projectId);
  }
}
