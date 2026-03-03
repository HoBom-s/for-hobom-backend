import { Inject, Injectable } from "@nestjs/common";
import { GetIssuesByProjectUseCase } from "../../ports/in/get-issues-by-project.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueQueryPort } from "../../ports/out/issue-query.port";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { IssueDocument } from "../../domain/model/issue.schema";

@Injectable()
export class GetIssuesByProjectService implements GetIssuesByProjectUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssueQueryPort)
    private readonly issueQueryPort: IssueQueryPort,
  ) {}

  public async invoke(projectId: ProjectId): Promise<IssueDocument[]> {
    return this.issueQueryPort.findByProject(projectId);
  }
}
