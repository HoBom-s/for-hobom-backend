import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { UpdateSprintUseCase } from "../../ports/in/update-sprint.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { SprintPersistencePort } from "../../ports/out/sprint-persistence.port";
import { SprintQueryPort } from "../../ports/out/sprint-query.port";
import { SprintId } from "../../domain/model/sprint-id.vo";
import { SprintDocument } from "../../domain/model/sprint.schema";
import { SprintStatus } from "../../domain/enums/sprint-status.enum";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class UpdateSprintService implements UpdateSprintUseCase {
  constructor(
    @Inject(DIToken.SprintModule.SprintPersistencePort)
    private readonly sprintPersistencePort: SprintPersistencePort,
    @Inject(DIToken.SprintModule.SprintQueryPort)
    private readonly sprintQueryPort: SprintQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    id: SprintId,
    name: string,
    goal: string | null,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    await lastValueFrom(
      this.verifyPlanningStatus(id).pipe(
        switchMap(() => this.updateSprint(id, name, goal, startDate, endDate)),
      ),
    );
  }

  private verifyPlanningStatus(id: SprintId): Observable<SprintDocument> {
    return from(this.sprintQueryPort.findById(id)).pipe(
      switchMap((sprint: SprintDocument) => {
        if (sprint.status !== SprintStatus.PLANNING) {
          throw new BadRequestException(
            "진행 중이거나 완료된 스프린트는 수정할 수 없어요.",
          );
        }
        return from(Promise.resolve(sprint));
      }),
    );
  }

  private updateSprint(
    id: SprintId,
    name: string,
    goal: string | null,
    startDate: Date,
    endDate: Date,
  ): Observable<void> {
    return from(
      this.sprintPersistencePort.update(id, { name, goal, startDate, endDate }),
    );
  }
}
