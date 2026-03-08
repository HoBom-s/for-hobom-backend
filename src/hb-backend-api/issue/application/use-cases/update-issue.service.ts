import { Inject, Injectable } from "@nestjs/common";
import { UpdateIssueUseCase } from "../../ports/in/update-issue.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssuePersistencePort } from "../../ports/out/issue-persistence.port";
import { IssueQueryPort } from "../../ports/out/issue-query.port";
import { IssueHistoryPersistencePort } from "../../ports/out/issue-history-persistence.port";
import { IssueId } from "../../domain/model/issue-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { IssueHistoryAction } from "../../domain/enums/issue-history-action.enum";
import { CreateIssueHistoryEntity } from "../../domain/model/issue-history.entity";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class UpdateIssueService implements UpdateIssueUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssuePersistencePort)
    private readonly issuePersistencePort: IssuePersistencePort,
    @Inject(DIToken.IssueModule.IssueQueryPort)
    private readonly issueQueryPort: IssueQueryPort,
    @Inject(DIToken.IssueModule.IssueHistoryPersistencePort)
    private readonly issueHistoryPersistencePort: IssueHistoryPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    id: IssueId,
    actor: UserId,
    data: Record<string, unknown>,
  ): Promise<void> {
    const issue = await this.issueQueryPort.findById(id);
    const changes = this.detectChanges(
      issue as unknown as Record<string, unknown>,
      data,
    );

    await this.issuePersistencePort.update(id, data);

    if (changes.length > 0) {
      await this.saveHistory(id, issue.project, actor, changes);
    }
  }

  private detectChanges(
    doc: Record<string, unknown>,
    data: Record<string, unknown>,
  ): { field: string; from: string | null; to: string | null }[] {
    return Object.keys(data)
      .map((key) => ({
        field: key,
        from: this.stringify(doc[key]),
        to: this.stringify(data[key]),
      }))
      .filter((c) => (c.from ?? "") !== (c.to ?? ""));
  }

  private async saveHistory(
    id: IssueId,
    project: unknown,
    actor: UserId,
    changes: { field: string; from: string | null; to: string | null }[],
  ): Promise<void> {
    await this.issueHistoryPersistencePort.save(
      CreateIssueHistoryEntity.of(
        id,
        ProjectId.fromString(String(project)),
        actor,
        IssueHistoryAction.UPDATED,
        changes,
      ),
    );
  }

  private stringify(v: unknown): string | null {
    if (v == null) return null;
    return typeof v === "string" ? v : JSON.stringify(v);
  }
}
