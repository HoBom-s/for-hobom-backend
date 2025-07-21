import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { FindTodayMenuByIdUseCase } from "../../domain/ports/in/find-today-menu-by-id.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { TodayMenuQueryPort } from "../../domain/ports/out/today-menu-query.port";
import { TodayMenuId } from "../../domain/model/today-menu.vo";
import {
  GetTodayMenuQueryResult,
  MenuItem,
  RegisterPerson,
} from "../../domain/ports/out/get-today-menu-query.result";
import { TodayMenuRelationEntity } from "../../domain/model/today-menu-with-relations.entity";
import { MenuRecommendationRelationEntity } from "../../../menu-recommendation/domain/model/menu-recommendation-with-relations.entity";

@Injectable()
export class FindTodayMenuByIdService implements FindTodayMenuByIdUseCase {
  constructor(
    @Inject(DIToken.TodayMenuModule.TodayMenuQueryPort)
    private readonly todayMenuQueryPort: TodayMenuQueryPort,
  ) {}

  public async invoke(id: TodayMenuId): Promise<GetTodayMenuQueryResult> {
    const todayMenu = await this.getBy(id);
    return this.toQueryResult(todayMenu);
  }

  private async getBy(id: TodayMenuId): Promise<TodayMenuRelationEntity> {
    return this.todayMenuQueryPort.findById(id);
  }

  private toQueryResult(
    entity: TodayMenuRelationEntity,
  ): GetTodayMenuQueryResult {
    const recommendedMenu = entity.getRecommendedMenu;
    if (recommendedMenu == null) {
      throw new NotFoundException("찾으려는 메뉴가 존재하지 않아요.");
    }
    const candidatesMenu = entity.getCandidates;
    return GetTodayMenuQueryResult.of(
      entity.getId,
      this.createMenuItem(recommendedMenu),
      candidatesMenu.map(this.createMenuItem),
      entity.getRecommendationDate,
    );
  }

  private createMenuItem(
    menuRecommendation: MenuRecommendationRelationEntity,
  ): MenuItem {
    return MenuItem.of(
      menuRecommendation.getId,
      menuRecommendation.getName,
      menuRecommendation.getMenuKind,
      menuRecommendation.getTimeOfMeal,
      menuRecommendation.getFoodType,
      RegisterPerson.of(
        menuRecommendation.getRegisterPerson.getId,
        menuRecommendation.getRegisterPerson.getUsername,
        menuRecommendation.getRegisterPerson.getNickname,
      ),
    );
  }
}
