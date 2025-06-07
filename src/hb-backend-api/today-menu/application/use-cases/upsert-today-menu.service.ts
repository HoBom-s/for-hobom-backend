import { Inject, Injectable } from "@nestjs/common";
import { UpsertTodayMenuUseCase } from "../ports/in/upsert-today-menu.use-case";
import { UpsertTodayMenuCommand } from "../command/upsert-today-menu.command";
import { DIToken } from "../../../../shared/di/token.di";
import { TodayMenuPersistencePort } from "../ports/out/today-menu-persistence.port";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { UpsertTodayMenuEntity } from "../../domain/entity/upsert-today-menu.entity";

@Injectable()
export class UpsertTodayMenuService implements UpsertTodayMenuUseCase {
  constructor(
    @Inject(DIToken.TodayMenuModule.TodayMenuPersistencePort)
    private readonly todayMenuPersistencePort: TodayMenuPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(command: UpsertTodayMenuCommand): Promise<void> {
    await this.upsert(command);
  }

  private async upsert(command: UpsertTodayMenuCommand): Promise<void> {
    await this.todayMenuPersistencePort.upsert(
      UpsertTodayMenuEntity.from(command),
    );
  }
}
