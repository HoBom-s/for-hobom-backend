import { Inject, Injectable } from "@nestjs/common";
import { IssueHistoryPersistencePort } from "../../ports/out/issue-history-persistence.port";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueHistoryRepository } from "../../domain/repositories/issue-history.repository";
import { CreateIssueHistoryEntity } from "../../domain/model/issue-history.entity";

@Injectable()
export class IssueHistoryPersistenceAdapter
  implements IssueHistoryPersistencePort
{
  constructor(
    @Inject(DIToken.IssueModule.IssueHistoryRepository)
    private readonly issueHistoryRepository: IssueHistoryRepository,
  ) {}

  public async save(entity: CreateIssueHistoryEntity): Promise<void> {
    await this.issueHistoryRepository.save(entity);
  }

  public async deleteByProject(projectId: ProjectId): Promise<void> {
    await this.issueHistoryRepository.deleteByProject(projectId);
  }
}
