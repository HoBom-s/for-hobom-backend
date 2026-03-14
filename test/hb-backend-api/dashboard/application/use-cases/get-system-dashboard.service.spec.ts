import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { GetSystemDashboardService } from "src/hb-backend-api/dashboard/application/use-cases/get-system-dashboard.service";
import { OutboxEntity } from "src/hb-backend-api/outbox/domain/model/outbox.entity";
import { SystemDashboardPeriod } from "src/hb-backend-api/dashboard/domain/enums/dashboard-period.enum";

const makeEmptyFacetResult = () => ({
  overview: [],
  byEventType: [],
  hourlyThroughput: [],
  recentFailures: [],
  retryDistribution: [],
});

describe("GetSystemDashboardService", () => {
  let service: GetSystemDashboardService;
  let outboxModel: { aggregate: jest.Mock };

  beforeEach(async () => {
    outboxModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([makeEmptyFacetResult()]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSystemDashboardService,
        { provide: getModelToken(OutboxEntity.name), useValue: outboxModel },
      ],
    }).compile();

    service = module.get(GetSystemDashboardService);
  });

  it("데이터가 없을 때 기본값으로 시스템 대시보드를 반환해야 한다", async () => {
    const result = await service.invoke(SystemDashboardPeriod.LAST_24H);

    expect(result.period).toBe(SystemDashboardPeriod.LAST_24H);
    expect(result.overview.total).toBe(0);
    expect(result.overview.sent).toBe(0);
    expect(result.overview.failed).toBe(0);
    expect(result.overview.pending).toBe(0);
    expect(result.overview.successRate).toBe(0);
    expect(result.byEventType).toEqual([]);
    expect(result.hourlyThroughput).toEqual([]);
    expect(result.recentFailures).toEqual([]);
    expect(result.retryDistribution).toEqual([]);
  });

  it("facet 데이터가 있을 때 결과를 정상적으로 매핑해야 한다", async () => {
    const failedAt = new Date("2026-03-14T10:00:00Z");
    outboxModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          overview: [{ total: 10, sent: 7, failed: 2, pending: 1 }],
          byEventType: [
            { _id: "MESSAGE", count: 6 },
            { _id: "HOBOM_LOG", count: 4 },
          ],
          hourlyThroughput: [{ _id: 10, count: 3 }],
          recentFailures: [
            {
              eventId: "evt-1",
              eventType: "MESSAGE",
              lastError: "timeout",
              retryCount: 2,
              failedAt,
            },
          ],
          retryDistribution: [
            { _id: 0, count: 8 },
            { _id: 1, count: 2 },
          ],
        },
      ]),
    });

    const result = await service.invoke(SystemDashboardPeriod.LAST_7D);

    expect(result.period).toBe(SystemDashboardPeriod.LAST_7D);
    expect(result.overview.total).toBe(10);
    expect(result.overview.sent).toBe(7);
    expect(result.overview.successRate).toBe(0.7);
    expect(result.byEventType).toHaveLength(2);
    expect(result.byEventType[0].eventType).toBe("MESSAGE");
    expect(result.hourlyThroughput).toHaveLength(1);
    expect(result.hourlyThroughput[0].hour).toBe(10);
    expect(result.recentFailures).toHaveLength(1);
    expect(result.recentFailures[0].eventId).toBe("evt-1");
    expect(result.retryDistribution).toHaveLength(2);
    expect(result.retryDistribution[0].retryCount).toBe(0);
  });

  it("LAST_30D 기간도 정상적으로 처리해야 한다", async () => {
    const result = await service.invoke(SystemDashboardPeriod.LAST_30D);

    expect(result.period).toBe(SystemDashboardPeriod.LAST_30D);
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  it("에러가 발생하면 전파되어야 한다", async () => {
    outboxModel.aggregate.mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("DB error")),
    });

    await expect(
      service.invoke(SystemDashboardPeriod.LAST_24H),
    ).rejects.toThrow("DB error");
  });
});
