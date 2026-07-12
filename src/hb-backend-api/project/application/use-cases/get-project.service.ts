import { Inject, Injectable } from "@nestjs/common";
import { GetProjectUseCase } from "../../ports/in/get-project.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { ProjectDocument } from "../../domain/model/project.schema";
import { ProjectId } from "../../domain/model/project-id.vo";

@Injectable()
export class GetProjectService implements GetProjectUseCase {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
  ) {}

  public async invoke(id: ProjectId): Promise<ProjectDocument> {
    return this.projectQueryPort.findById(id);
  }
}
