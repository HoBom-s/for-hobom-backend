import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { DashboardController } from "src/hb-backend-api/dashboard/adapters/in/rest/dashboard.controller";
import { DIToken } from "src/shared/di/token.di";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import {
  DashboardPeriod,
  SystemDashboardPeriod,
} from "src/hb-backend-api/dashboard/domain/enums/dashboard-period.enum";
import { TokenUserInformation } from "src/shared/adapters/in/rest/decorator/access-token.decorator";
import { UserQueryResult } from "src/hb-backend-api/user/domain/ports/out/user-query.result";

const userId = new UserId(new Types.ObjectId());

const makeUserResult = () =>
  new UserQueryResult(userId, "testuser", "test@test.com", "testnick", []);

const makeUserInfo = (): TokenUserInformation =>
  ({ nickname: "testnick" }) as TokenUserInformation;

const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
const mockGetDailyTodoDashboardUseCase = { invoke: jest.fn() };
const mockGetNoteDashboardUseCase = { invoke: jest.fn() };
const mockGetFutureMessageDashboardUseCase = { invoke: jest.fn() };
const mockGetNotificationDashboardUseCase = { invoke: jest.fn() };
const mockGetSystemDashboardUseCase = { invoke: jest.fn() };
const mockGetActivityDashboardUseCase = { invoke: jest.fn() };
const mockGetProjectIssueDashboardUseCase = { invoke: jest.fn() };
const mockGetSprintDashboardUseCase = { invoke: jest.fn() };

describe("DashboardController", () => {
  let controller: DashboardController;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(makeUserResult());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.DashboardModule.GetDailyTodoDashboardUseCase,
          useValue: mockGetDailyTodoDashboardUseCase,
        },
        {
          provide: DIToken.DashboardModule.GetNoteDashboardUseCase,
          useValue: mockGetNoteDashboardUseCase,
        },
        {
          provide: DIToken.DashboardModule.GetFutureMessageDashboardUseCase,
          useValue: mockGetFutureMessageDashboardUseCase,
        },
        {
          provide: DIToken.DashboardModule.GetNotificationDashboardUseCase,
          useValue: mockGetNotificationDashboardUseCase,
        },
        {
          provide: DIToken.DashboardModule.GetSystemDashboardUseCase,
          useValue: mockGetSystemDashboardUseCase,
        },
        {
          provide: DIToken.DashboardModule.GetActivityDashboardUseCase,
          useValue: mockGetActivityDashboardUseCase,
        },
        {
          provide: DIToken.DashboardModule.GetProjectIssueDashboardUseCase,
          useValue: mockGetProjectIssueDashboardUseCase,
        },
        {
          provide: DIToken.DashboardModule.GetSprintDashboardUseCase,
          useValue: mockGetSprintDashboardUseCase,
        },
      ],
    }).compile();

    controller = module.get(DashboardController);
  });

  describe("getDailyTodoDashboard", () => {
    const dashboardResult = {
      period: DashboardPeriod.WEEKLY,
      startDate: new Date(),
      endDate: new Date(),
      overview: {
        total: 5,
        completed: 3,
        completionRate: 0.6,
        reactionsCount: 1,
      },
      daily: [],
      byCategory: [],
      byCycle: [],
    };

    it("기본 period로 데일리 투두 대시보드를 반환해야 한다", async () => {
      mockGetDailyTodoDashboardUseCase.invoke.mockResolvedValue(
        dashboardResult,
      );

      const result = await controller.getDailyTodoDashboard(makeUserInfo());

      expect(result.period).toBe(DashboardPeriod.WEEKLY);
      expect(result.overview.total).toBe(5);
      expect(mockGetDailyTodoDashboardUseCase.invoke).toHaveBeenCalledWith(
        userId,
        DashboardPeriod.WEEKLY,
        expect.any(Date),
      );
    });

    it("MONTHLY period를 전달하면 그대로 use case에 전달해야 한다", async () => {
      mockGetDailyTodoDashboardUseCase.invoke.mockResolvedValue({
        ...dashboardResult,
        period: DashboardPeriod.MONTHLY,
      });

      await controller.getDailyTodoDashboard(makeUserInfo(), "MONTHLY");

      expect(mockGetDailyTodoDashboardUseCase.invoke).toHaveBeenCalledWith(
        userId,
        DashboardPeriod.MONTHLY,
        expect.any(Date),
      );
    });
  });

  describe("getNoteDashboard", () => {
    it("노트 대시보드를 반환해야 한다", async () => {
      const noteResult = {
        overview: { total: 10, checklistCompletionRate: 0.5 },
        byStatus: [],
        byType: [],
        byLabel: [],
        dailyCreated: [],
      };
      mockGetNoteDashboardUseCase.invoke.mockResolvedValue(noteResult);

      const result = await controller.getNoteDashboard(makeUserInfo());

      expect(result.overview.total).toBe(10);
      expect(mockGetNoteDashboardUseCase.invoke).toHaveBeenCalledWith(userId);
    });
  });

  describe("getFutureMessageDashboard", () => {
    it("미래 메시지 대시보드를 반환해야 한다", async () => {
      const fmResult = {
        overview: { total: 3, pending: 2, sent: 1 },
        upcoming: [],
        monthlyTrend: [],
      };
      mockGetFutureMessageDashboardUseCase.invoke.mockResolvedValue(fmResult);

      const result = await controller.getFutureMessageDashboard(makeUserInfo());

      expect(result.overview.total).toBe(3);
      expect(mockGetFutureMessageDashboardUseCase.invoke).toHaveBeenCalledWith(
        userId,
      );
    });
  });

  describe("getNotificationDashboard", () => {
    it("알림 대시보드를 반환해야 한다", async () => {
      const notifResult = {
        period: DashboardPeriod.WEEKLY,
        startDate: new Date(),
        endDate: new Date(),
        overview: { total: 5, read: 3, unread: 2 },
        dailyTrend: [],
        byCategory: [],
        recentUnread: [],
      };
      mockGetNotificationDashboardUseCase.invoke.mockResolvedValue(notifResult);

      const result = await controller.getNotificationDashboard(makeUserInfo());

      expect(result.overview.total).toBe(5);
      expect(mockGetNotificationDashboardUseCase.invoke).toHaveBeenCalledWith(
        userId,
        DashboardPeriod.WEEKLY,
        expect.any(Date),
      );
    });
  });

  describe("getSystemDashboard", () => {
    it("시스템 대시보드를 반환해야 한다", async () => {
      const sysResult = {
        period: SystemDashboardPeriod.LAST_24H,
        startDate: new Date(),
        endDate: new Date(),
        overview: {
          total: 100,
          sent: 90,
          failed: 5,
          pending: 5,
          successRate: 0.9,
        },
        byEventType: [],
        hourlyThroughput: [],
        recentFailures: [],
        retryDistribution: [],
      };
      mockGetSystemDashboardUseCase.invoke.mockResolvedValue(sysResult);

      const result = await controller.getSystemDashboard();

      expect(result.period).toBe(SystemDashboardPeriod.LAST_24H);
      expect(mockGetSystemDashboardUseCase.invoke).toHaveBeenCalledWith(
        SystemDashboardPeriod.LAST_24H,
      );
    });

    it("잘못된 period는 기본값 LAST_24H를 사용해야 한다", async () => {
      mockGetSystemDashboardUseCase.invoke.mockResolvedValue({
        period: SystemDashboardPeriod.LAST_24H,
        startDate: new Date(),
        endDate: new Date(),
        overview: { total: 0, sent: 0, failed: 0, pending: 0, successRate: 0 },
        byEventType: [],
        hourlyThroughput: [],
        recentFailures: [],
        retryDistribution: [],
      });

      await controller.getSystemDashboard("INVALID");

      expect(mockGetSystemDashboardUseCase.invoke).toHaveBeenCalledWith(
        SystemDashboardPeriod.LAST_24H,
      );
    });
  });

  describe("getActivityDashboard", () => {
    it("활동 대시보드를 반환해야 한다", async () => {
      const actResult = {
        period: DashboardPeriod.WEEKLY,
        startDate: new Date(),
        endDate: new Date(),
        overview: {
          activeDays: 5,
          totalDays: 7,
          activityRate: 5 / 7,
          currentStreak: 3,
          longestStreak: 5,
        },
        heatmap: [],
        moduleUsage: [],
      };
      mockGetActivityDashboardUseCase.invoke.mockResolvedValue(actResult);

      const result = await controller.getActivityDashboard(makeUserInfo());

      expect(result.overview.activeDays).toBe(5);
      expect(mockGetActivityDashboardUseCase.invoke).toHaveBeenCalledWith(
        userId,
        DashboardPeriod.WEEKLY,
        expect.any(Date),
      );
    });
  });

  describe("getProjectIssueDashboard", () => {
    it("프로젝트 이슈 대시보드를 반환해야 한다", async () => {
      const issueResult = {
        overview: {
          total: 20,
          open: 15,
          done: 5,
          completionRate: 0.25,
          overdueCount: 2,
        },
        byStatus: [],
        byPriority: [],
        byType: [],
      };
      mockGetProjectIssueDashboardUseCase.invoke.mockResolvedValue(issueResult);

      const pid = new Types.ObjectId();
      const result = await controller.getProjectIssueDashboard(
        pid.toHexString(),
      );

      expect(result.overview.total).toBe(20);
      expect(mockGetProjectIssueDashboardUseCase.invoke).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe("getSprintDashboard", () => {
    it("스프린트 대시보드를 반환해야 한다", async () => {
      const sprintResult = {
        sprint: {
          id: "sprint-1",
          name: "Sprint 1",
          goal: null,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: new Date(),
        },
        overview: {
          totalIssues: 10,
          completedIssues: 4,
          completionRate: 0.4,
          totalStoryPoints: 30,
          completedStoryPoints: 12,
        },
      };
      mockGetSprintDashboardUseCase.invoke.mockResolvedValue(sprintResult);

      const pid = new Types.ObjectId();
      const sid = new Types.ObjectId();
      const result = await controller.getSprintDashboard(
        pid.toHexString(),
        sid.toHexString(),
      );

      expect(result.sprint.name).toBe("Sprint 1");
      expect(result.overview.totalIssues).toBe(10);
      expect(mockGetSprintDashboardUseCase.invoke).toHaveBeenCalledTimes(1);
    });
  });
});
