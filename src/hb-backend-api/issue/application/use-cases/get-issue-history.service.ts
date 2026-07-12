import { Inject, Injectable } from "@nestjs/common";
import { GetIssueHistoryUseCase } from "../../ports/in/get-issue-history.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueHistoryQueryPort } from "../../ports/out/issue-history-query.port";
import { IssueId } from "../../domain/model/issue-id.vo";
import { IssueHistoryDocument } from "../../domain/model/issue-history.schema";

@Injectable()
export class GetIssueHistoryService implements GetIssueHistoryUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssueHistoryQueryPort)
    private readonly issueHistoryQueryPort: IssueHistoryQueryPort,
  ) {}

  public async invoke(issueId: IssueId): Promise<IssueHistoryDocument[]> {
    return this.issueHistoryQueryPort.findByIssue(issueId);
  }
}
