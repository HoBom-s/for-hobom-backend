import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { StartSprintUseCase } from "../../ports/in/start-sprint.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { SprintPersistencePort } from "../../ports/out/sprint-persistence.port";
import { SprintQueryPort } from "../../ports/out/sprint-query.port";
import { SprintId } from "../../domain/model/sprint-id.vo";
import { SprintDocument } from "../../domain/model/sprint.schema";
import { SprintStatus } from "../../domain/enums/sprint-status.enum";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class StartSprintService implements StartSprintUseCase {
  constructor(
    @Inject(DIToken.SprintModule.SprintPersistencePort)
    private readonly sprintPersistencePort: SprintPersistencePort,
    @Inject(DIToken.SprintModule.SprintQueryPort)
    private readonly sprintQueryPort: SprintQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: SprintId): Promise<void> {
    await lastValueFrom(
      this.verifyPlanningStatus(id).pipe(
        switchMap((sprint: SprintDocument) =>
          this.verifyNoActiveSprint(
            ProjectId.fromString(String(sprint.project)),
          ),
        ),
        switchMap(() => this.startSprint(id)),
      ),
    );
  }

  private verifyPlanningStatus(id: SprintId): Observable<SprintDocument> {
    return from(this.sprintQueryPort.findById(id)).pipe(
      switchMap((sprint: SprintDocument) => {
        if (sprint.status !== SprintStatus.PLANNING) {
          throw new BadRequestException(
            "계획 상태의 스프린트만 시작할 수 있어요.",
          );
        }
        return from(Promise.resolve(sprint));
      }),
    );
  }

  private verifyNoActiveSprint(projectId: ProjectId): Observable<void> {
    return from(this.sprintQueryPort.findActiveSprint(projectId)).pipe(
      switchMap((activeSprint: SprintDocument | null) => {
        if (activeSprint != null) {
          throw new BadRequestException("이미 진행 중인 스프린트가 있어요.");
        }
        return from(Promise.resolve());
      }),
    );
  }

  private startSprint(id: SprintId): Observable<void> {
    return from(
      this.sprintPersistencePort.update(id, {
        status: SprintStatus.ACTIVE,
      }),
    );
  }
}
