import { Inject, Injectable } from "@nestjs/common";
import { DeleteLabelUseCase } from "../../domain/ports/in/delete-label.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LabelPersistencePort } from "../../domain/ports/out/label-persistence.port";
import { LabelQueryPort } from "../../domain/ports/out/label-query.port";
import { LabelId } from "../../domain/model/label-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class DeleteLabelService implements DeleteLabelUseCase {
  constructor(
    @Inject(DIToken.LabelModule.LabelQueryPort)
    private readonly labelQueryPort: LabelQueryPort,
    @Inject(DIToken.LabelModule.LabelPersistencePort)
    private readonly labelPersistencePort: LabelPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: LabelId, owner: UserId): Promise<void> {
    const label = await this.labelQueryPort.findById(id, owner);
    await this.labelPersistencePort.deleteOne(label.getId, owner);
  }
}
