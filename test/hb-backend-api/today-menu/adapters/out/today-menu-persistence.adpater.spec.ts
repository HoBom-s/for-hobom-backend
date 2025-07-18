import { Types } from "mongoose";
import { TodayMenuRepository } from "../../../../../src/hb-backend-api/today-menu/infra/today-menu.repository";
import { TodayMenuPersistenceAdapter } from "../../../../../src/hb-backend-api/today-menu/adapters/out/today-menu-persistence.adapter";
import { createTodayMenuRepository } from "../../../../mocks/today-menu.repository.mock";
import { UpsertTodayMenuEntity } from "../../../../../src/hb-backend-api/today-menu/domain/model/upsert-today-menu.entity";
import { MenuRecommendationId } from "../../../../../src/hb-backend-api/menu-recommendation/domain/model/menu-recommendation-id.vo";
import { TodayMenuId } from "../../../../../src/hb-backend-api/today-menu/domain/model/today-menu.vo";
import { YearMonthDayString } from "../../../../../src/hb-backend-api/daily-todo/domain/vo/year-month-day-string.vo";

describe("TodayMenuPersistenceAdapter", () => {
  let todayMenuRepository: jest.Mocked<TodayMenuRepository>;
  let todayMenuPersistenceAdapter: TodayMenuPersistenceAdapter;

  beforeEach(() => {
    todayMenuRepository = createTodayMenuRepository();
    todayMenuPersistenceAdapter = new TodayMenuPersistenceAdapter(
      todayMenuRepository,
    );
  });

  describe("upsert()", () => {
    it("should call todayMenuPersistenceAdapter.upsert with the given today menu entity", async () => {
      const menuId = new MenuRecommendationId(new Types.ObjectId());
      const todayMenuId = new TodayMenuId(new Types.ObjectId());
      const todayMenu = UpsertTodayMenuEntity.of(
        [menuId],
        menuId,
        YearMonthDayString.fromString("2025-05-27"),
        todayMenuId,
      );

      await todayMenuPersistenceAdapter.upsert(todayMenu);

      expect(todayMenuRepository.upsert).toHaveBeenCalledTimes(1);
      expect(todayMenuRepository.upsert).toHaveBeenCalledWith(todayMenu);
    });
  });
});
