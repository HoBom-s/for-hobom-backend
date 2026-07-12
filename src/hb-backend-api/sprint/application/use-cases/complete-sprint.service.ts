import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { CompleteSprintUseCase } from "../../ports/in/complete-sprint.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { SprintPersistencePort } from "../../ports/out/sprint-persistence.port";
import { SprintQueryPort } from "../../ports/out/sprint-query.port";
import { SprintId } from "../../domain/model/sprint-id.vo";
import { SprintDocument } from "../../domain/model/sprint.schema";
import { SprintStatus } from "../../domain/enums/sprint-status.enum";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class CompleteSprintService implements CompleteSprintUseCase {
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
      this.verifyActiveStatus(id).pipe(
        switchMap(() => this.completeSprint(id)),
      ),
    );
  }

  private verifyActiveStatus(id: SprintId): Observable<SprintDocument> {
    return from(this.sprintQueryPort.findById(id)).pipe(
      switchMap((sprint: SprintDocument) => {
        if (sprint.status !== SprintStatus.ACTIVE) {
          throw new BadRequestException(
            "활성 상태의 스프린트만 완료할 수 있어요.",
          );
        }
        return from(Promise.resolve(sprint));
      }),
    );
  }

  private completeSprint(id: SprintId): Observable<void> {
    return from(
      this.sprintPersistencePort.update(id, {
        status: SprintStatus.COMPLETED,
        completedAt: new Date(),
      }),
    );
  }
}
