import { Inject, Injectable } from "@nestjs/common";
import { IssueQueryPort } from "../../ports/out/issue-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { IssueRepository } from "../../domain/repositories/issue.repository";
import { IssueDocument } from "../../domain/model/issue.schema";
import { IssueId } from "../../domain/model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { SprintId } from "../../../sprint/domain/model/sprint-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Injectable()
export class IssueQueryAdapter implements IssueQueryPort {
  constructor(
    @Inject(DIToken.IssueModule.IssueRepository)
    private readonly issueRepository: IssueRepository,
  ) {}

  public async findById(id: IssueId): Promise<IssueDocument> {
    return this.issueRepository.findById(id);
  }

  public async findByIssueKey(
    projectId: ProjectId,
    issueNumber: number,
  ): Promise<IssueDocument | null> {
    return this.issueRepository.findByIssueKey(projectId, issueNumber);
  }

  public async findByProject(projectId: ProjectId): Promise<IssueDocument[]> {
    return this.issueRepository.findByProject(projectId);
  }

  public async findBySprint(sprintId: SprintId): Promise<IssueDocument[]> {
    return this.issueRepository.findBySprint(sprintId);
  }

  public async findByAssignee(userId: UserId): Promise<IssueDocument[]> {
    return this.issueRepository.findByAssignee(userId);
  }

  public async findByParent(parentId: IssueId): Promise<IssueDocument[]> {
    return this.issueRepository.findByParent(parentId);
  }
}
