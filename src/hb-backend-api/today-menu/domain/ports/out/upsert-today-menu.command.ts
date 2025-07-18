import { MenuRecommendationId } from "../../../../menu-recommendation/domain/model/menu-recommendation-id.vo";
import { TodayMenuId } from "../../model/today-menu.vo";
import { YearMonthDayString } from "../../../../daily-todo/domain/vo/year-month-day-string.vo";

export class UpsertTodayMenuCommand {
  constructor(
    private readonly candidates: MenuRecommendationId[],
    private readonly recommendedMenu: MenuRecommendationId | null,
    private readonly recommendationDate?: YearMonthDayString | null,
    private readonly todayMenuId?: TodayMenuId | null,
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
  ): UpsertTodayMenuCommand {
    return new UpsertTodayMenuCommand(
      candidates,
      recommendedMenu,
      recommendationDate,
      todayMenuId,
    );
  }

  public get getCandidates(): MenuRecommendationId[] {
    return this.candidates;
  }

  public get getRecommendedMenu(): MenuRecommendationId | null {
    if (this.recommendedMenu == null) {
      return null;
    }

    return this.recommendedMenu;
  }

  public get getRecommendationDate(): YearMonthDayString | null {
    if (this.recommendationDate == null) {
      return null;
    }

    return this.recommendationDate;
  }

  public get getTodayMenuId(): TodayMenuId | null {
    if (this.todayMenuId == null) {
      return null;
    }

    return this.todayMenuId;
  }
}
