import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { UpdateProjectUseCase } from "../../ports/in/update-project.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { ProjectId } from "../../domain/model/project-id.vo";

@Injectable()
export class UpdateProjectService implements UpdateProjectUseCase {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectPersistencePort)
    private readonly projectPersistencePort: ProjectPersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
  ) {}

  public async invoke(
    id: ProjectId,
    name: string,
    description: string | null,
  ): Promise<void> {
    await lastValueFrom(
      this.verifyExists(id).pipe(
        switchMap(() => this.updateProject(id, name, description)),
      ),
    );
  }

  private verifyExists(id: ProjectId): Observable<void> {
    return from(this.projectQueryPort.findById(id)).pipe(
      switchMap(() => from(Promise.resolve())),
    );
  }

  private updateProject(
    id: ProjectId,
    name: string,
    description: string | null,
  ): Observable<void> {
    return from(this.projectPersistencePort.update(id, { name, description }));
  }
}
