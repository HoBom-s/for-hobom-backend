import { MenuRecommendationId } from "../../../menu-recommendation/domain/vo/menu-recommendation-id.vo";
import { UpsertTodayMenuCommand } from "../../application/command/upsert-today-menu.command";
import { TodayMenuId } from "../vo/today-menu.vo";
import { YearMonthDayString } from "../../../daily-todo/domain/vo/year-month-day-string.vo";

export class UpsertTodayMenuEntity {
  constructor(
    private readonly candidates: MenuRecommendationId[],
    private readonly recommendedMenu: MenuRecommendationId | null,
    private readonly recommendationDate: YearMonthDayString | null,
    private readonly todayMenuId: TodayMenuId | null,
  ) {
    this.candidates = candidates;
    this.recommendedMenu = recommendedMenu;
    this.recommendationDate = recommendationDate;
    this.todayMenuId = todayMenuId;
  }

  public static of(
    candidates: MenuRecommendationId[],
    recommendedMenu: MenuRecommendationId | null,
    recommendationDate: YearMonthDayString | null,
    todayMenuId: TodayMenuId | null,
  ): UpsertTodayMenuEntity {
    return new UpsertTodayMenuEntity(
      candidates,
      recommendedMenu,
      recommendationDate,
      todayMenuId,
    );
  }

  public static from(command: UpsertTodayMenuCommand): UpsertTodayMenuEntity {
    return new UpsertTodayMenuEntity(
      command.getCandidates,
      command.getRecommendedMenu,
      command.getRecommendationDate,
      command.getTodayMenuId,
    );
  }

  public get getTodayMenuId(): TodayMenuId | null {
    if (this.todayMenuId == null) {
      return null;
    }

    return this.todayMenuId;
  }

  public get getRecommendedMenu(): MenuRecommendationId | null {
    if (this.recommendedMenu == null) {
      return null;
    }

    return this.recommendedMenu;
  }

  public get getCandidates(): MenuRecommendationId[] {
    return this.candidates;
  }

  public get getRecommendationDate(): YearMonthDayString | null {
    if (this.recommendationDate == null) {
      return null;
    }

    return this.recommendationDate;
  }
}
