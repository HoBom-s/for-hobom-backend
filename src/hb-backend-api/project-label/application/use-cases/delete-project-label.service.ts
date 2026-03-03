import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { DeleteProjectLabelUseCase } from "../../ports/in/delete-project-label.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectLabelPersistencePort } from "../../ports/out/project-label-persistence.port";
import { ProjectLabelQueryPort } from "../../ports/out/project-label-query.port";
import { ProjectLabelId } from "../../domain/model/project-label-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class DeleteProjectLabelService implements DeleteProjectLabelUseCase {
  constructor(
    @Inject(DIToken.ProjectLabelModule.ProjectLabelPersistencePort)
    private readonly projectLabelPersistencePort: ProjectLabelPersistencePort,
    @Inject(DIToken.ProjectLabelModule.ProjectLabelQueryPort)
    private readonly projectLabelQueryPort: ProjectLabelQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: ProjectLabelId): Promise<void> {
    await lastValueFrom(
      this.verifyExists(id).pipe(switchMap(() => this.deleteLabel(id))),
    );
  }

  private verifyExists(id: ProjectLabelId): Observable<void> {
    return from(this.projectLabelQueryPort.findById(id)).pipe(
      switchMap(() => from(Promise.resolve())),
    );
  }

  private deleteLabel(id: ProjectLabelId): Observable<void> {
    return from(this.projectLabelPersistencePort.deleteOne(id));
  }
}
