import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { UpdateProjectIssueTypesUseCase } from "../../ports/in/update-project-issue-types.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { ProjectId } from "../../domain/model/project-id.vo";

@Injectable()
export class UpdateProjectIssueTypesService implements UpdateProjectIssueTypesUseCase {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectPersistencePort)
    private readonly projectPersistencePort: ProjectPersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
  ) {}

  public async invoke(
    projectId: ProjectId,
    issueTypes: {
      id: string;
      name: string;
      icon: string;
      isSubtask: boolean;
    }[],
  ): Promise<void> {
    await lastValueFrom(
      this.verifyExists(projectId).pipe(
        // TODO: 기존 이슈에서 사용 중인 타입 삭제 방지
        switchMap(() => this.updateIssueTypes(projectId, issueTypes)),
      ),
    );
  }

  private verifyExists(projectId: ProjectId): Observable<void> {
    return from(this.projectQueryPort.findById(projectId)).pipe(
      switchMap(() => from(Promise.resolve())),
    );
  }

  private updateIssueTypes(
    projectId: ProjectId,
    issueTypes: {
      id: string;
      name: string;
      icon: string;
      isSubtask: boolean;
    }[],
  ): Observable<void> {
    return from(this.projectPersistencePort.update(projectId, { issueTypes }));
  }
}
