import { TodayMenuId } from "../../model/today-menu.vo";
import { YearMonthDayString } from "../../../../daily-todo/domain/vo/year-month-day-string.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { MenuRecommendationId } from "../../../../menu-recommendation/domain/model/menu-recommendation-id.vo";
import { MenuTimeOfMeal } from "../../../../menu-recommendation/domain/model/menu-time-of-meal.enum";
import { FoodType } from "../../../../menu-recommendation/domain/model/food-type.enum";
import { MenuKind } from "../../../../menu-recommendation/domain/model/menu-kind.enum";

export class RegisterPerson {
  constructor(
    private readonly id: UserId,
    private readonly username: string,
    private readonly nickname: string,
  ) {
    this.id = id;
    this.username = username;
    this.nickname = nickname;
  }

  public static of(
    id: UserId,
    username: string,
    nickname: string,
  ): RegisterPerson {
    return new RegisterPerson(id, username, nickname);
  }

  public get getId(): UserId {
    return this.id;
  }

  public get getUsername(): string {
    return this.username;
  }

  public get getNickname(): string {
    return this.nickname;
  }
}

export class MenuItem {
  constructor(
    private readonly id: MenuRecommendationId,
    private readonly name: string,
    private readonly menuKind: MenuKind,
    private readonly timeOfMeal: MenuTimeOfMeal,
    private readonly foodType: FoodType,
    private readonly registerPerson: RegisterPerson,
  ) {
    this.id = id;
    this.name = name;
    this.menuKind = menuKind;
    this.timeOfMeal = timeOfMeal;
    this.foodType = foodType;
    this.registerPerson = registerPerson;
  }

  public static of(
    id: MenuRecommendationId,
    name: string,
    menuKind: MenuKind,
    timeOfMeal: MenuTimeOfMeal,
    foodType: FoodType,
    registerPerson: RegisterPerson,
  ): MenuItem {
    return new MenuItem(
      id,
      name,
      menuKind,
      timeOfMeal,
      foodType,
      registerPerson,
    );
  }
}

export class GetTodayMenuQueryResult {
  constructor(
    private readonly id: TodayMenuId,
    private readonly recommendedMenu: MenuItem,
    private readonly candidates: MenuItem[],
    private readonly recommendationDate: YearMonthDayString,
  ) {
    this.id = id;
    this.recommendedMenu = recommendedMenu;
    this.candidates = candidates;
    this.recommendationDate = recommendationDate;
  }

  public static of(
    id: TodayMenuId,
    recommendedMenu: MenuItem,
    candidates: MenuItem[],
    recommendationDate: YearMonthDayString,
  ): GetTodayMenuQueryResult {
    return new GetTodayMenuQueryResult(
      id,
      recommendedMenu,
      candidates,
      recommendationDate,
    );
  }

  public get getId(): TodayMenuId {
    return this.id;
  }

  public get getRecommendedMenu(): MenuItem {
    return this.recommendedMenu;
  }

  public get getCandidates(): MenuItem[] {
    return this.candidates;
  }

  public get getRecommendationDate(): YearMonthDayString {
    return this.recommendationDate;
  }
}
