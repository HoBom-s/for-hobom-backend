import { Inject, Injectable } from "@nestjs/common";
import { IssuePersistencePort } from "../../ports/out/issue-persistence.port";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueRepository } from "../../domain/repositories/issue.repository";
import { CreateIssueEntity } from "../../domain/model/issue.entity";
import { IssueId } from "../../domain/model/issue-id.vo";

@Injectable()
export class IssuePersistenceAdapter implements IssuePersistencePort {
  constructor(
    @Inject(DIToken.IssueModule.IssueRepository)
    private readonly issueRepository: IssueRepository,
  ) {}

  public async save(entity: CreateIssueEntity): Promise<void> {
    await this.issueRepository.save(entity);
  }

  public async update(
    id: IssueId,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.issueRepository.update(id, data);
  }

  public async deleteOne(id: IssueId): Promise<void> {
    await this.issueRepository.deleteOne(id);
  }

  public async deleteByProject(projectId: ProjectId): Promise<void> {
    await this.issueRepository.deleteByProject(projectId);
  }
}
