import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { GetFutureMessageDashboardService } from "src/hb-backend-api/dashboard/application/use-cases/get-future-message-dashboard.service";
import { FutureMessageEntity } from "src/hb-backend-api/future-message/domain/model/future-message.entity";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";

const makeFacetResult = (overrides: Record<string, unknown> = {}) => ({
  byStatus: [],
  upcoming: [],
  monthlyTrend: [],
  overview: [],
  ...overrides,
});

describe("GetFutureMessageDashboardService", () => {
  let service: GetFutureMessageDashboardService;
  let futureMessageModel: { aggregate: jest.Mock };

  const senderId = UserId.fromString(new Types.ObjectId().toHexString());

  beforeEach(async () => {
    jest.clearAllMocks();

    futureMessageModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([makeFacetResult()]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFutureMessageDashboardService,
        {
          provide: getModelToken(FutureMessageEntity.name),
          useValue: futureMessageModel,
        },
      ],
    }).compile();

    service = module.get(GetFutureMessageDashboardService);
  });

  it("데이터가 없을 때 기본값으로 대시보드를 반환해야 한다", async () => {
    const result = await service.invoke(senderId);

    expect(result.overview.total).toBe(0);
    expect(result.overview.pending).toBe(0);
    expect(result.overview.sent).toBe(0);
    expect(result.upcoming).toEqual([]);
    expect(result.monthlyTrend).toEqual([]);
  });

  it("정상 데이터가 있을 때 upcoming과 monthlyTrend를 매핑해야 한다", async () => {
    const msgId = new Types.ObjectId();
    futureMessageModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        makeFacetResult({
          byStatus: [
            { _id: "PENDING", count: 3 },
            { _id: "SENT", count: 7 },
          ],
          upcoming: [
            {
              _id: msgId,
              title: "생일 축하 메시지",
              recipientId: "user-123",
              scheduledAt: "2026-04-01",
            },
          ],
          monthlyTrend: [{ _id: "2026-03", count: 5 }],
          overview: [{ total: 10 }],
        }),
      ]),
    });

    const result = await service.invoke(senderId);

    expect(result.overview.total).toBe(10);
    expect(result.overview.pending).toBe(3);
    expect(result.overview.sent).toBe(7);
    expect(result.upcoming).toHaveLength(1);
    expect(result.upcoming[0].title).toBe("생일 축하 메시지");
    expect(result.upcoming[0].id).toBe(msgId.toString());
    expect(result.monthlyTrend).toHaveLength(1);
    expect(result.monthlyTrend[0].month).toBe("2026-03");
    expect(result.monthlyTrend[0].count).toBe(5);
  });

  it("PENDING 상태만 있고 SENT가 없으면 sent는 0이어야 한다", async () => {
    futureMessageModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        makeFacetResult({
          byStatus: [{ _id: "PENDING", count: 4 }],
          overview: [{ total: 4 }],
        }),
      ]),
    });

    const result = await service.invoke(senderId);

    expect(result.overview.total).toBe(4);
    expect(result.overview.pending).toBe(4);
    expect(result.overview.sent).toBe(0);
  });
});
