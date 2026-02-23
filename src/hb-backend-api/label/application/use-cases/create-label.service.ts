import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateLabelUseCase } from "../../domain/ports/in/create-label.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LabelPersistencePort } from "../../domain/ports/out/label-persistence.port";
import { LabelQueryPort } from "../../domain/ports/out/label-query.port";
import { CreateLabelCommand } from "../../domain/ports/out/create-label.command";
import { LabelCreateEntitySchema } from "../../domain/model/label.entity";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class CreateLabelService implements CreateLabelUseCase {
  constructor(
    @Inject(DIToken.LabelModule.LabelPersistencePort)
    private readonly labelPersistencePort: LabelPersistencePort,
    @Inject(DIToken.LabelModule.LabelQueryPort)
    private readonly labelQueryPort: LabelQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(command: CreateLabelCommand): Promise<void> {
    const existing = await this.labelQueryPort.findByTitle(
      command.getTitle,
      command.getOwner,
    );
    if (existing != null) {
      throw new BadRequestException(
        `이미 존재하는 라벨이에요. ${command.getTitle.raw}`,
      );
    }
    await this.labelPersistencePort.save(
      LabelCreateEntitySchema.of(command.getTitle, command.getOwner),
    );
  }
}
