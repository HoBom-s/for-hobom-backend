import { Inject, Injectable } from "@nestjs/common";
import { PatchLabelUseCase } from "../../domain/ports/in/patch-label.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LabelPersistencePort } from "../../domain/ports/out/label-persistence.port";
import { LabelQueryPort } from "../../domain/ports/out/label-query.port";
import { LabelId } from "../../domain/model/label-id.vo";
import { PatchLabelCommand } from "../../domain/ports/out/patch-label.command";
import { LabelUpdateEntitySchema } from "../../domain/model/label.entity";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class PatchLabelService implements PatchLabelUseCase {
  constructor(
    @Inject(DIToken.LabelModule.LabelQueryPort)
    private readonly labelQueryPort: LabelQueryPort,
    @Inject(DIToken.LabelModule.LabelPersistencePort)
    private readonly labelPersistencePort: LabelPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(id: LabelId, command: PatchLabelCommand): Promise<void> {
    const label = await this.labelQueryPort.findById(id, command.getOwner);
    await this.labelPersistencePort.updateOne(
      label.getId,
      LabelUpdateEntitySchema.of(command.getTitle, command.getOwner),
    );
  }
}
