import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { UpdateIssueUseCase } from "../../ports/in/update-issue.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssuePersistencePort } from "../../ports/out/issue-persistence.port";
import { IssueQueryPort } from "../../ports/out/issue-query.port";
import { IssueHistoryPersistencePort } from "../../ports/out/issue-history-persistence.port";
import { IssueId } from "../../domain/model/issue-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { IssueHistoryAction } from "../../domain/enums/issue-history-action.enum";
import { CreateIssueHistoryEntity } from "../../domain/model/issue-history.entity";
import { IssueDocument } from "../../domain/model/issue.schema";
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
    await lastValueFrom(
      this.findIssue(id).pipe(
        switchMap((issue) => {
          const doc = issue as unknown as Record<string, unknown>;
          return this.updateAndRecordHistory(
            id,
            ProjectId.fromString(String(issue.project)),
            actor,
            data,
            doc,
          );
        }),
      ),
    );
  }

  private stringify(v: unknown): string | null {
    if (v == null) return null;
    return typeof v === "string" ? v : JSON.stringify(v);
  }

  private findIssue(id: IssueId): Observable<IssueDocument> {
    return from(this.issueQueryPort.findById(id));
  }

  private updateAndRecordHistory(
    id: IssueId,
    projectId: ProjectId,
    actor: UserId,
    data: Record<string, unknown>,
    issue: Record<string, unknown>,
  ): Observable<void> {
    return from(
      (async () => {
        const changes: {
          field: string;
          from: string | null;
          to: string | null;
        }[] = [];

        for (const key of Object.keys(data)) {
          const oldStr = this.stringify(issue[key]);
          const newStr = this.stringify(data[key]);
          if ((oldStr ?? "") !== (newStr ?? "")) {
            changes.push({ field: key, from: oldStr, to: newStr });
          }
        }

        await this.issuePersistencePort.update(id, data);

        if (changes.length > 0) {
          await this.issueHistoryPersistencePort.save(
            CreateIssueHistoryEntity.of(
              id,
              projectId,
              actor,
              IssueHistoryAction.UPDATED,
              changes,
            ),
          );
        }
      })(),
    );
  }
}
