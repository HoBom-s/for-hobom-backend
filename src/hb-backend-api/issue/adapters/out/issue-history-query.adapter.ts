import { Inject, Injectable } from "@nestjs/common";
import { IssueHistoryQueryPort } from "../../ports/out/issue-history-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueHistoryRepository } from "../../domain/repositories/issue-history.repository";
import { IssueHistoryDocument } from "../../domain/model/issue-history.schema";
import { IssueId } from "../../domain/model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

@Injectable()
export class IssueHistoryQueryAdapter implements IssueHistoryQueryPort {
  constructor(
    @Inject(DIToken.IssueModule.IssueHistoryRepository)
    private readonly issueHistoryRepository: IssueHistoryRepository,
  ) {}

  public async findByIssue(issueId: IssueId): Promise<IssueHistoryDocument[]> {
    return this.issueHistoryRepository.findByIssue(issueId);
  }

  public async findByProject(
    projectId: ProjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<IssueHistoryDocument[]> {
    return this.issueHistoryRepository.findByProject(
      projectId,
      startDate,
      endDate,
    );
  }
}
