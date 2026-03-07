import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap, tap } from "rxjs";
import { UpdateProjectWorkflowUseCase } from "../../ports/in/update-project-workflow.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { IssueQueryPort } from "../../../issue/ports/out/issue-query.port";
import { ProjectId } from "../../domain/model/project-id.vo";
import { IssueDocument } from "../../../issue/domain/model/issue.schema";

@Injectable()
export class UpdateProjectWorkflowService
  implements UpdateProjectWorkflowUseCase
{
  constructor(
    @Inject(DIToken.ProjectModule.ProjectPersistencePort)
    private readonly projectPersistencePort: ProjectPersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
    @Inject(DIToken.IssueModule.IssueQueryPort)
    private readonly issueQueryPort: IssueQueryPort,
  ) {}

  public async invoke(
    projectId: ProjectId,
    workflow: {
      statuses: {
        id: string;
        name: string;
        isDone: boolean;
        order: number;
      }[];
      transitions: { from: string; to: string; name: string }[];
    },
  ): Promise<void> {
    await lastValueFrom(
      this.verifyExists(projectId).pipe(
        switchMap(() => this.verifyNoOrphanedStatuses(projectId, workflow)),
        switchMap(() => this.updateWorkflow(projectId, workflow)),
      ),
    );
  }

  private verifyExists(projectId: ProjectId): Observable<void> {
    return from(this.projectQueryPort.findById(projectId)).pipe(
      switchMap(() => from(Promise.resolve())),
    );
  }

  private verifyNoOrphanedStatuses(
    projectId: ProjectId,
    workflow: {
      statuses: {
        id: string;
        name: string;
        isDone: boolean;
        order: number;
      }[];
      transitions: { from: string; to: string; name: string }[];
    },
  ): Observable<void> {
    return from(this.issueQueryPort.findByProject(projectId)).pipe(
      tap((issues: IssueDocument[]) => {
        const newStatusIds = new Set(workflow.statuses.map((s) => s.id));
        const orphanedStatuses = issues
          .filter((issue) => !newStatusIds.has(issue.status))
          .map((issue) => issue.status);

        if (orphanedStatuses.length > 0) {
          const uniqueStatuses = [...new Set(orphanedStatuses)];
          throw new BadRequestException(
            `이슈에서 사용 중인 상태를 삭제할 수 없어요: ${uniqueStatuses.join(", ")}`,
          );
        }
      }),
      switchMap(() => from(Promise.resolve())),
    );
  }

  private updateWorkflow(
    projectId: ProjectId,
    workflow: {
      statuses: {
        id: string;
        name: string;
        isDone: boolean;
        order: number;
      }[];
      transitions: { from: string; to: string; name: string }[];
    },
  ): Observable<void> {
    return from(this.projectPersistencePort.update(projectId, { workflow }));
  }
}
