import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  EMPTY,
  from,
  lastValueFrom,
  map,
  Observable,
  switchMap,
  tap,
} from "rxjs";
import { CreateProjectUseCase } from "../../ports/in/create-project.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { ProjectKey } from "../../domain/model/project-key.vo";
import { ProjectId } from "../../domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { CreateProjectEntity } from "../../domain/model/project.entity";
import { ProjectDocument } from "../../domain/model/project.schema";
import {
  DEFAULT_ISSUE_TYPES,
  DEFAULT_PRIORITIES,
  DEFAULT_WORKFLOW,
} from "../../domain/constants/project-defaults.constant";

@Injectable()
export class CreateProjectService implements CreateProjectUseCase {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectPersistencePort)
    private readonly projectPersistencePort: ProjectPersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    key: ProjectKey,
    name: string,
    description: string | null,
    owner: UserId,
  ): Promise<void> {
    await lastValueFrom(
      this.verifyDuplicateProjectKey(key).pipe(
        switchMap(() => this.saveProject(key, name, description, owner)),
        switchMap(() => this.setupDefaults(key)),
      ),
    );
  }

  private verifyDuplicateProjectKey(key: ProjectKey): Observable<void> {
    return from(this.projectQueryPort.findByKey(key)).pipe(
      tap((found) => {
        if (found != null) {
          throw new BadRequestException(
            `이미 존재하는 프로젝트 키에요. ${key.raw}`,
          );
        }
      }),
      map(() => undefined as void),
    );
  }

  private saveProject(
    key: ProjectKey,
    name: string,
    description: string | null,
    owner: UserId,
  ): Observable<void> {
    return from(
      this.projectPersistencePort.save(
        CreateProjectEntity.of(key, name, description, owner),
      ),
    );
  }

  private setupDefaults(key: ProjectKey): Observable<void> {
    return from(this.projectQueryPort.findByKey(key)).pipe(
      switchMap((project: ProjectDocument | null) => {
        if (project == null) {
          return EMPTY;
        }
        const projectId = ProjectId.fromString(String(project._id));
        return from(
          this.projectPersistencePort.update(projectId, {
            workflow: DEFAULT_WORKFLOW,
            issueTypes: DEFAULT_ISSUE_TYPES,
            priorities: DEFAULT_PRIORITIES,
          }),
        );
      }),
    );
  }
}
