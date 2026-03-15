import { Inject, Injectable } from "@nestjs/common";
import { IssueCommentPersistencePort } from "../../ports/out/issue-comment-persistence.port";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueCommentRepository } from "../../domain/repositories/issue-comment.repository";
import { CreateIssueCommentEntity } from "../../domain/model/issue-comment.entity";
import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";

@Injectable()
export class IssueCommentPersistenceAdapter implements IssueCommentPersistencePort {
  constructor(
    @Inject(DIToken.IssueModule.IssueCommentRepository)
    private readonly issueCommentRepository: IssueCommentRepository,
  ) {}

  public async save(entity: CreateIssueCommentEntity): Promise<void> {
    await this.issueCommentRepository.save(entity);
  }

  public async update(
    id: IssueCommentId,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.issueCommentRepository.update(id, data);
  }

  public async softDelete(id: IssueCommentId): Promise<void> {
    await this.issueCommentRepository.softDelete(id);
  }

  public async deleteByProject(projectId: ProjectId): Promise<void> {
    await this.issueCommentRepository.deleteByProject(projectId);
  }
}
