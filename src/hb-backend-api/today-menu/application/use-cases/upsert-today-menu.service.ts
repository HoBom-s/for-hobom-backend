import { Inject, Injectable } from "@nestjs/common";
import { UpsertTodayMenuUseCase } from "../../domain/ports/in/upsert-today-menu.use-case";
import { UpsertTodayMenuCommand } from "../../domain/ports/out/upsert-today-menu.command";
import { DIToken } from "../../../../shared/di/token.di";
import { TodayMenuPersistencePort } from "../../domain/ports/out/today-menu-persistence.port";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { UpsertTodayMenuEntity } from "../../domain/model/upsert-today-menu.entity";
import { TodayMenuId } from "../../domain/model/today-menu.vo";

@Injectable()
export class UpsertTodayMenuService implements UpsertTodayMenuUseCase {
  constructor(
    @Inject(DIToken.TodayMenuModule.TodayMenuPersistencePort)
    private readonly todayMenuPersistencePort: TodayMenuPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(command: UpsertTodayMenuCommand): Promise<TodayMenuId> {
    return await this.upsert(command);
  }

  private async upsert(command: UpsertTodayMenuCommand): Promise<TodayMenuId> {
    return await this.todayMenuPersistencePort.upsert(
      UpsertTodayMenuEntity.from(command),
    );
  }
}
