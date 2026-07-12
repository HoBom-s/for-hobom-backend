import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { GetActivityDashboardService } from "src/hb-backend-api/dashboard/application/use-cases/get-activity-dashboard.service";
import { DailyTodoEntity } from "src/hb-backend-api/daily-todo/domain/entity/daily-todo.entity";
import { NoteEntity } from "src/hb-backend-api/note/domain/model/note.entity";
import { FutureMessageEntity } from "src/hb-backend-api/future-message/domain/model/future-message.entity";
import { NotificationEntity } from "src/hb-backend-api/notification/domain/model/notification.entity";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { DashboardPeriod } from "src/hb-backend-api/dashboard/domain/enums/dashboard-period.enum";

const makeAggregateChain = (result: unknown[]) => ({
  aggregate: jest
    .fn()
    .mockReturnValue({ exec: jest.fn().mockResolvedValue(result) }),
});

describe("GetActivityDashboardService", () => {
  let service: GetActivityDashboardService;
  let dailyTodoModel: ReturnType<typeof makeAggregateChain>;
  let noteModel: ReturnType<typeof makeAggregateChain>;
  let futureMessageModel: ReturnType<typeof makeAggregateChain>;
  let notificationModel: ReturnType<typeof makeAggregateChain>;

  beforeEach(async () => {
    dailyTodoModel = makeAggregateChain([]);
    noteModel = makeAggregateChain([]);
    futureMessageModel = makeAggregateChain([]);
    notificationModel = makeAggregateChain([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetActivityDashboardService,
        {
          provide: getModelToken(DailyTodoEntity.name),
          useValue: dailyTodoModel,
        },
        { provide: getModelToken(NoteEntity.name), useValue: noteModel },
        {
          provide: getModelToken(FutureMessageEntity.name),
          useValue: futureMessageModel,
        },
        {
          provide: getModelToken(NotificationEntity.name),
          useValue: notificationModel,
        },
      ],
    }).compile();

    service = module.get(GetActivityDashboardService);
  });

  it("WEEKLY 기간으로 활동 대시보드를 반환해야 한다", async () => {
    const owner = new UserId(new Types.ObjectId());
    const date = new Date("2026-03-14");

    const result = await service.invoke(owner, DashboardPeriod.WEEKLY, date);

    expect(result.period).toBe(DashboardPeriod.WEEKLY);
    expect(result.overview.totalDays).toBe(7);
    expect(result.overview.activeDays).toBe(0);
    expect(result.heatmap).toHaveLength(7);
    expect(result.moduleUsage).toHaveLength(4);
    expect(dailyTodoModel.aggregate).toHaveBeenCalledTimes(1);
    expect(noteModel.aggregate).toHaveBeenCalledTimes(1);
    expect(futureMessageModel.aggregate).toHaveBeenCalledTimes(1);
    expect(notificationModel.aggregate).toHaveBeenCalledTimes(1);
  });

  it("MONTHLY 기간으로 totalDays 30을 반환해야 한다", async () => {
    const owner = new UserId(new Types.ObjectId());
    const date = new Date("2026-03-14");

    const result = await service.invoke(owner, DashboardPeriod.MONTHLY, date);

    expect(result.period).toBe(DashboardPeriod.MONTHLY);
    expect(result.overview.totalDays).toBe(30);
    expect(result.heatmap).toHaveLength(30);
  });

  it("활동 데이터가 있을 때 heatmap과 streak을 계산해야 한다", async () => {
    const date = new Date("2026-03-14T12:00:00Z");
    const heatmapDate = (() => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10);
    })();

    dailyTodoModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ _id: heatmapDate, count: 3 }]),
    });
    noteModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ _id: heatmapDate, count: 2 }]),
    });

    const owner = new UserId(new Types.ObjectId());
    const result = await service.invoke(owner, DashboardPeriod.WEEKLY, date);

    expect(result.overview.activeDays).toBe(1);
    expect(result.overview.currentStreak).toBeGreaterThanOrEqual(0);
    expect(result.overview.longestStreak).toBeGreaterThanOrEqual(1);

    const activeEntries = result.heatmap.filter((h) => h.count > 0);
    expect(activeEntries).toHaveLength(1);
    expect(activeEntries[0].count).toBe(5);

    const todoUsage = result.moduleUsage.find((m) => m.module === "daily-todo");
    expect(todoUsage).toBeDefined();
    expect(todoUsage!.count).toBe(3);

    const noteUsage = result.moduleUsage.find((m) => m.module === "note");
    expect(noteUsage).toBeDefined();
    expect(noteUsage!.count).toBe(2);
  });

  it("에러가 발생하면 전파되어야 한다", async () => {
    dailyTodoModel.aggregate.mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("DB error")),
    });

    const owner = new UserId(new Types.ObjectId());

    await expect(
      service.invoke(owner, DashboardPeriod.WEEKLY, new Date()),
    ).rejects.toThrow("DB error");
  });
});
