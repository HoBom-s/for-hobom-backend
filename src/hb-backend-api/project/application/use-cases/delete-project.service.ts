import { Inject, Injectable } from "@nestjs/common";
import { forkJoin, from, lastValueFrom, Observable, switchMap } from "rxjs";
import { DeleteProjectUseCase } from "../../ports/in/delete-project.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { IssuePersistencePort } from "../../../issue/ports/out/issue-persistence.port";
import { IssueCommentPersistencePort } from "../../../issue/ports/out/issue-comment-persistence.port";
import { IssueHistoryPersistencePort } from "../../../issue/ports/out/issue-history-persistence.port";
import { SprintPersistencePort } from "../../../sprint/ports/out/sprint-persistence.port";
import { BoardPersistencePort } from "../../../board/ports/out/board-persistence.port";
import { ProjectLabelPersistencePort } from "../../../project-label/ports/out/project-label-persistence.port";
import { ProjectId } from "../../domain/model/project-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class DeleteProjectService implements DeleteProjectUseCase {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectPersistencePort)
    private readonly projectPersistencePort: ProjectPersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
    @Inject(DIToken.IssueModule.IssuePersistencePort)
    private readonly issuePersistencePort: IssuePersistencePort,
    @Inject(DIToken.IssueModule.IssueCommentPersistencePort)
    private readonly issueCommentPersistencePort: IssueCommentPersistencePort,
    @Inject(DIToken.IssueModule.IssueHistoryPersistencePort)
    private readonly issueHistoryPersistencePort: IssueHistoryPersistencePort,
    @Inject(DIToken.SprintModule.SprintPersistencePort)
    private readonly sprintPersistencePort: SprintPersistencePort,
    @Inject(DIToken.BoardModule.BoardPersistencePort)
    private readonly boardPersistencePort: BoardPersistencePort,
    @Inject(DIToken.ProjectLabelModule.ProjectLabelPersistencePort)
    private readonly projectLabelPersistencePort: ProjectLabelPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: ProjectId): Promise<void> {
    await lastValueFrom(
      this.verifyExists(id).pipe(
        switchMap(() => this.deleteRelatedData(id)),
        switchMap(() => this.deleteProject(id)),
      ),
    );
  }

  private verifyExists(id: ProjectId): Observable<void> {
    return from(this.projectQueryPort.findById(id)).pipe(
      switchMap(() => from(Promise.resolve())),
    );
  }

  private deleteRelatedData(id: ProjectId): Observable<void[]> {
    return forkJoin([
      from(this.issuePersistencePort.deleteByProject(id)),
      from(this.issueCommentPersistencePort.deleteByProject(id)),
      from(this.issueHistoryPersistencePort.deleteByProject(id)),
      from(this.sprintPersistencePort.deleteByProject(id)),
      from(this.boardPersistencePort.deleteByProject(id)),
      from(this.projectLabelPersistencePort.deleteByProject(id)),
    ]);
  }

  private deleteProject(id: ProjectId): Observable<void> {
    return from(this.projectPersistencePort.deleteOne(id));
  }
}
