import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { DeleteSprintUseCase } from "../../ports/in/delete-sprint.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { SprintPersistencePort } from "../../ports/out/sprint-persistence.port";
import { SprintQueryPort } from "../../ports/out/sprint-query.port";
import { SprintId } from "../../domain/model/sprint-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class DeleteSprintService implements DeleteSprintUseCase {
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
      this.verifyExists(id).pipe(switchMap(() => this.deleteSprint(id))),
    );
  }

  private verifyExists(id: SprintId): Observable<void> {
    return from(this.sprintQueryPort.findById(id)).pipe(
      switchMap(() => from(Promise.resolve())),
    );
  }

  private deleteSprint(id: SprintId): Observable<void> {
    return from(this.sprintPersistencePort.deleteOne(id));
  }
}
