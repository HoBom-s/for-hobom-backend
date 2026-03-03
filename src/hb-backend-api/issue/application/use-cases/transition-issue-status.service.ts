import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { TransitionIssueStatusUseCase } from "../../ports/in/transition-issue-status.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssuePersistencePort } from "../../ports/out/issue-persistence.port";
import { IssueQueryPort } from "../../ports/out/issue-query.port";
import { IssueHistoryPersistencePort } from "../../ports/out/issue-history-persistence.port";
import { ProjectQueryPort } from "../../../project/ports/out/project-query.port";
import { IssueId } from "../../domain/model/issue-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { IssueHistoryAction } from "../../domain/enums/issue-history-action.enum";
import { StatusCategory } from "../../../project/domain/enums/status-category.enum";
import { CreateIssueHistoryEntity } from "../../domain/model/issue-history.entity";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class TransitionIssueStatusService
  implements TransitionIssueStatusUseCase
{
  constructor(
    @Inject(DIToken.IssueModule.IssuePersistencePort)
    private readonly issuePersistencePort: IssuePersistencePort,
    @Inject(DIToken.IssueModule.IssueQueryPort)
    private readonly issueQueryPort: IssueQueryPort,
    @Inject(DIToken.IssueModule.IssueHistoryPersistencePort)
    private readonly issueHistoryPersistencePort: IssueHistoryPersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    id: IssueId,
    newStatusId: string,
    actor: UserId,
  ): Promise<void> {
    const issue = await this.issueQueryPort.findById(id);
    const project = await this.projectQueryPort.findById(
      ProjectId.fromString(String(issue.project)),
    );

    const workflow = project.workflow;
    if (workflow == null) {
      throw new BadRequestException(
        "프로젝트에 워크플로우가 설정되지 않았어요.",
      );
    }

    const currentStatusId = issue.status;
    const validTransition = workflow.transitions.some(
      (t) => t.from === currentStatusId && t.to === newStatusId,
    );
    if (!validTransition) {
      throw new BadRequestException(
        `'${currentStatusId}'에서 '${newStatusId}'로의 전환은 허용되지 않아요.`,
      );
    }

    const targetStatus = workflow.statuses.find((s) => s.id === newStatusId);
    if (targetStatus == null) {
      throw new BadRequestException(`상태 '${newStatusId}'를 찾을 수 없어요.`);
    }

    const updateData: Record<string, unknown> = {
      status: newStatusId,
      statusCategory: targetStatus.category,
    };

    if (targetStatus.category === StatusCategory.DONE) {
      updateData.resolvedAt = new Date();
    }

    await this.issuePersistencePort.update(id, updateData);

    await this.issueHistoryPersistencePort.save(
      CreateIssueHistoryEntity.of(
        id,
        ProjectId.fromString(String(issue.project)),
        actor,
        IssueHistoryAction.TRANSITIONED,
        [
          {
            field: "status",
            from: currentStatusId,
            to: newStatusId,
          },
        ],
      ),
    );
  }
}
