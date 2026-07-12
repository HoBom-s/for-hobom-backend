import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { GetNotificationDashboardService } from "src/hb-backend-api/dashboard/application/use-cases/get-notification-dashboard.service";
import { NotificationEntity } from "src/hb-backend-api/notification/domain/model/notification.entity";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { DashboardPeriod } from "src/hb-backend-api/dashboard/domain/enums/dashboard-period.enum";

const makeFacetResult = (overrides: Record<string, unknown> = {}) => ({
  overview: [],
  dailyTrend: [],
  byCategory: [],
  recentUnread: [],
  ...overrides,
});

describe("GetNotificationDashboardService", () => {
  let service: GetNotificationDashboardService;
  let notificationModel: { aggregate: jest.Mock };

  const owner = UserId.fromString(new Types.ObjectId().toHexString());

  beforeEach(async () => {
    jest.clearAllMocks();

    notificationModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([makeFacetResult()]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNotificationDashboardService,
        {
          provide: getModelToken(NotificationEntity.name),
          useValue: notificationModel,
        },
      ],
    }).compile();

    service = module.get(GetNotificationDashboardService);
  });

  it("WEEKLY 기간에 데이터가 없을 때 기본값을 반환해야 한다", async () => {
    const date = new Date("2026-03-14");

    const result = await service.invoke(owner, DashboardPeriod.WEEKLY, date);

    expect(result.period).toBe(DashboardPeriod.WEEKLY);
    expect(result.overview.total).toBe(0);
    expect(result.overview.read).toBe(0);
    expect(result.overview.unread).toBe(0);
    expect(result.dailyTrend).toEqual([]);
    expect(result.byCategory).toEqual([]);
    expect(result.recentUnread).toEqual([]);

    // startDate = date - 6 days at 00:00:00, endDate = date at 23:59:59.999
    // spans 7 calendar days (6 days subtracted + current day)
    const diffMs = result.endDate.getTime() - result.startDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(7);
  });

  it("MONTHLY 기간일 때 날짜 범위가 30일을 커버해야 한다", async () => {
    const date = new Date("2026-03-14");

    notificationModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        makeFacetResult({
          overview: [{ total: 25, read: 20, unread: 5 }],
          dailyTrend: [{ _id: "2026-03-14", count: 3 }],
          byCategory: [{ _id: "SYSTEM", count: 10 }],
        }),
      ]),
    });

    const result = await service.invoke(owner, DashboardPeriod.MONTHLY, date);

    expect(result.period).toBe(DashboardPeriod.MONTHLY);
    expect(result.overview.total).toBe(25);
    expect(result.overview.read).toBe(20);
    expect(result.overview.unread).toBe(5);

    // startDate = date - 29 days at 00:00:00, endDate = date at 23:59:59.999
    // spans 30 calendar days (29 days subtracted + current day)
    const diffMs = result.endDate.getTime() - result.startDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it("recentUnread 항목이 있을 때 정상적으로 매핑해야 한다", async () => {
    const notifId = new Types.ObjectId();
    const createdAt = new Date("2026-03-14T10:00:00Z");

    notificationModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        makeFacetResult({
          overview: [{ total: 5, read: 2, unread: 3 }],
          recentUnread: [
            {
              _id: notifId,
              title: "새로운 이슈 할당",
              category: "ISSUE",
              createdAt,
            },
          ],
        }),
      ]),
    });

    const result = await service.invoke(
      owner,
      DashboardPeriod.WEEKLY,
      new Date("2026-03-14"),
    );

    expect(result.overview.total).toBe(5);
    expect(result.recentUnread).toHaveLength(1);
    expect(result.recentUnread[0].id).toBe(notifId.toString());
    expect(result.recentUnread[0].title).toBe("새로운 이슈 할당");
    expect(result.recentUnread[0].category).toBe("ISSUE");
    expect(result.recentUnread[0].createdAt).toEqual(createdAt);
  });
});
