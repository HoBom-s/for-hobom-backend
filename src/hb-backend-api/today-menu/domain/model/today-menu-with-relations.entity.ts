import { MenuKind } from "../../../menu-recommendation/domain/model/menu-kind.enum";
import { MenuTimeOfMeal } from "../../../menu-recommendation/domain/model/menu-time-of-meal.enum";
import { FoodType } from "../../../menu-recommendation/domain/model/food-type.enum";
import { TodayMenuId } from "./today-menu.vo";
import { MenuRecommendationRelationEntity } from "../../../menu-recommendation/domain/model/menu-recommendation-with-relations.entity";
import { YearMonthDayString } from "../../../daily-todo/domain/vo/year-month-day-string.vo";

export interface MenuItem {
  id: string;
  name: string;
  menuKind: MenuKind;
  timeOfMeal: MenuTimeOfMeal;
  foodType: FoodType;
  registerPerson: {
    id: string;
    username: string;
    nickname: string;
  };
}

export class TodayMenuWithRelationsEntity {
  id: string;

  recommendedMenu: MenuItem;

  candidates: MenuItem[];

  recommendationDate: string;
}

export class TodayMenuRelationEntity {
  constructor(
    private readonly id: TodayMenuId,
    private readonly recommendedMenu: MenuRecommendationRelationEntity | null,
    private readonly candidates: MenuRecommendationRelationEntity[],
    private readonly recommendationDate: YearMonthDayString,
  ) {
    this.id = id;
    this.recommendedMenu = recommendedMenu;
    this.candidates = candidates;
    this.recommendationDate = recommendationDate;
  }

  public static of(
    id: TodayMenuId,
    recommendedMenu: MenuRecommendationRelationEntity | null,
    candidates: MenuRecommendationRelationEntity[],
    recommendationDate: YearMonthDayString,
  ): TodayMenuRelationEntity {
    return new TodayMenuRelationEntity(
      id,
      recommendedMenu,
      candidates,
      recommendationDate,
    );
  }

  public get getId(): TodayMenuId {
    return this.id;
  }

  public get getRecommendedMenu(): MenuRecommendationRelationEntity | null {
    if (this.recommendedMenu == null) {
      return null;
    }
    return this.recommendedMenu;
  }

  public get getCandidates(): MenuRecommendationRelationEntity[] {
    return this.candidates;
  }

  public get getRecommendationDate(): YearMonthDayString {
    return this.recommendationDate;
  }
}
