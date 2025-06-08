import { Inject, Injectable } from "@nestjs/common";
import { TodayMenuPersistencePort } from "../../../application/ports/out/today-menu-persistence.port";
import { DIToken } from "../../../../../shared/di/token.di";
import { TodayMenuRepository } from "../../../infra/today-menu.repository";
import { UpsertTodayMenuEntity } from "src/hb-backend-api/today-menu/domain/entity/upsert-today-menu.entity";
import { TodayMenuId } from "../../../domain/vo/today-menu.vo";

@Injectable()
export class TodayMenuPersistenceAdapter implements TodayMenuPersistencePort {
  constructor(
    @Inject(DIToken.TodayMenuModule.TodayMenuRepository)
    private readonly todayMenuRepository: TodayMenuRepository,
  ) {}

  public async upsert(entity: UpsertTodayMenuEntity): Promise<TodayMenuId> {
    return await this.todayMenuRepository.upsert(entity);
  }
}
