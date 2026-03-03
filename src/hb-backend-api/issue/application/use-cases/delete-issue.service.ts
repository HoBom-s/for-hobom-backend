import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
import { DeleteIssueUseCase } from "../../ports/in/delete-issue.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { IssuePersistencePort } from "../../ports/out/issue-persistence.port";
import { IssueQueryPort } from "../../ports/out/issue-query.port";
import { IssueId } from "../../domain/model/issue-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class DeleteIssueService implements DeleteIssueUseCase {
  constructor(
    @Inject(DIToken.IssueModule.IssuePersistencePort)
    private readonly issuePersistencePort: IssuePersistencePort,
    @Inject(DIToken.IssueModule.IssueQueryPort)
    private readonly issueQueryPort: IssueQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: IssueId): Promise<void> {
    await lastValueFrom(
      this.verifyNoChildren(id).pipe(switchMap(() => this.softDelete(id))),
    );
  }

  private verifyNoChildren(id: IssueId): Observable<void> {
    return from(
      (async () => {
        const children = await this.issueQueryPort.findByParent(id);
        if (children.length > 0) {
          throw new BadRequestException(
            "하위 이슈가 존재하는 이슈는 삭제할 수 없어요.",
          );
        }
      })(),
    );
  }

  private softDelete(id: IssueId): Observable<void> {
    return from(this.issuePersistencePort.deleteOne(id));
  }
}
