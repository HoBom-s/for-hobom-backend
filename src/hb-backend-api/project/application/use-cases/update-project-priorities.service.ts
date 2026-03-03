import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { UpdateProjectPrioritiesUseCase } from "../../ports/in/update-project-priorities.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { ProjectId } from "../../domain/model/project-id.vo";

@Injectable()
export class UpdateProjectPrioritiesService
  implements UpdateProjectPrioritiesUseCase
{
  constructor(
    @Inject(DIToken.ProjectModule.ProjectPersistencePort)
    private readonly projectPersistencePort: ProjectPersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
  ) {}

  public async invoke(
    projectId: ProjectId,
    priorities: {
      id: string;
      name: string;
      icon: string;
      order: number;
    }[],
  ): Promise<void> {
    await lastValueFrom(
      this.verifyExists(projectId).pipe(
        // TODO: 기존 이슈에서 사용 중인 우선순위 삭제 방지
        switchMap(() => this.updatePriorities(projectId, priorities)),
      ),
    );
  }

  private verifyExists(projectId: ProjectId): Observable<void> {
    return from(this.projectQueryPort.findById(projectId)).pipe(
      switchMap(() => from(Promise.resolve())),
    );
  }

  private updatePriorities(
    projectId: ProjectId,
    priorities: {
      id: string;
      name: string;
      icon: string;
      order: number;
    }[],
  ): Observable<void> {
    return from(this.projectPersistencePort.update(projectId, { priorities }));
  }
}
