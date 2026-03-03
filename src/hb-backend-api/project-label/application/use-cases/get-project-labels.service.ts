import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom } from "rxjs";
import { GetProjectLabelsUseCase } from "../../ports/in/get-project-labels.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectLabelQueryPort } from "../../ports/out/project-label-query.port";
import { ProjectLabelDocument } from "../../domain/model/project-label.schema";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

@Injectable()
export class GetProjectLabelsService implements GetProjectLabelsUseCase {
  constructor(
    @Inject(DIToken.ProjectLabelModule.ProjectLabelQueryPort)
    private readonly projectLabelQueryPort: ProjectLabelQueryPort,
  ) {}

  public async invoke(projectId: ProjectId): Promise<ProjectLabelDocument[]> {
    return lastValueFrom(
      from(this.projectLabelQueryPort.findByProject(projectId)),
    );
  }
}
