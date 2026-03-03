import { Inject, Injectable } from "@nestjs/common";
import { GetIssueUseCase } from "../../ports/in/get-issue.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueQueryPort } from "../../ports/out/issue-query.port";
import { IssueId } from "../../domain/model/issue-id.vo";
import { IssueDocument } from "../../domain/model/issue.schema";

@Injectable()
export class GetIssueService implements GetIssueUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssueQueryPort)
    private readonly issueQueryPort: IssueQueryPort,
  ) {}

  public async invoke(id: IssueId): Promise<IssueDocument> {
    return this.issueQueryPort.findById(id);
  }
}
