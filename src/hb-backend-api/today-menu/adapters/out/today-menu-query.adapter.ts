import { Inject, Injectable } from "@nestjs/common";
import { TodayMenuQueryPort } from "../../domain/ports/out/today-menu-query.port";
import {
  MenuItem,
  TodayMenuRelationEntity,
  TodayMenuWithRelationsEntity,
} from "../../domain/model/today-menu-with-relations.entity";
import { DIToken } from "../../../../shared/di/token.di";
import { TodayMenuRepository } from "../../infra/today-menu.repository";
import { TodayMenuId } from "../../domain/model/today-menu.vo";
import {
  MenuRecommendationRelationEntity,
  RegisterPerson,
} from "../../../menu-recommendation/domain/model/menu-recommendation-with-relations.entity";
import { MenuRecommendationId } from "../../../menu-recommendation/domain/model/menu-recommendation-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { YearMonthDayString } from "../../../daily-todo/domain/vo/year-month-day-string.vo";

@Injectable()
export class TodayMenuQueryAdapter implements TodayMenuQueryPort {
  constructor(
    @Inject(DIToken.TodayMenuModule.TodayMenuRepository)
    private readonly todayMenuRepository: TodayMenuRepository,
  ) {}

  public async findById(id: TodayMenuId): Promise<TodayMenuRelationEntity> {
    const todayMenu = await this.getBy(id);
    return this.toRelationEntity(todayMenu);
  }

  public async findRecommendedMenuById(
    id: TodayMenuId,
  ): Promise<TodayMenuRelationEntity> {
    const recommendedMenu = await this.getRecommendedMenuBy(id);
    return this.toRelationEntity(recommendedMenu);
  }

  private async getBy(id: TodayMenuId): Promise<TodayMenuWithRelationsEntity> {
    return await this.todayMenuRepository.findById(id);
  }

  private async getRecommendedMenuBy(
    id: TodayMenuId,
  ): Promise<TodayMenuWithRelationsEntity> {
    return await this.todayMenuRepository.findRecommendedMenuById(id);
  }

  private toRelationEntity(
    entity: TodayMenuWithRelationsEntity,
  ): TodayMenuRelationEntity {
    return TodayMenuRelationEntity.of(
      TodayMenuId.fromSting(entity.id),
      entity.recommendedMenu?.id == null
        ? null
        : this.toMenuRecommendation(entity.recommendedMenu),
      entity.candidates.map(this.toMenuRecommendation),
      YearMonthDayString.fromString(entity.recommendationDate),
    );
  }

  private toMenuRecommendation(
    menuItem: MenuItem,
  ): MenuRecommendationRelationEntity {
    return MenuRecommendationRelationEntity.of(
      MenuRecommendationId.fromString(menuItem.id),
      menuItem.name,
      menuItem.menuKind,
      menuItem.timeOfMeal,
      menuItem.foodType,
      RegisterPerson.of(
        UserId.fromString(menuItem.registerPerson.id),
        menuItem.registerPerson.username,
        menuItem.registerPerson.nickname,
      ),
    );
  }
}
