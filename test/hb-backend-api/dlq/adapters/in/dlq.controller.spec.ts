import { Test, TestingModule } from "@nestjs/testing";
import { DlqController } from "../../../../../src/hb-backend-api/dlq/adapters/in/dlq.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";

describe("DlqController", () => {
  let controller: DlqController;
  const mockGetDlqListUseCase = { invoke: jest.fn() };
  const mockGetDlqDetailUseCase = { invoke: jest.fn() };
  const mockRetryDlqUseCase = { invoke: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DlqController],
      providers: [
        {
          provide: DIToken.DlqModule.GetDlqListUseCase,
          useValue: mockGetDlqListUseCase,
        },
        {
          provide: DIToken.DlqModule.GetDlqDetailUseCase,
          useValue: mockGetDlqDetailUseCase,
        },
        {
          provide: DIToken.DlqModule.RetryDlqUseCase,
          useValue: mockRetryDlqUseCase,
        },
      ],
    }).compile();

    controller = module.get(DlqController);
  });

  describe("getList", () => {
    it("should return DLQ list DTO", async () => {
      mockGetDlqListUseCase.invoke.mockResolvedValue({
        items: ["dlq:menu:1", "dlq:menu:2"],
      });

      const result = await controller.getList();

      expect(result.items).toEqual(["dlq:menu:1", "dlq:menu:2"]);
      expect(mockGetDlqListUseCase.invoke).toHaveBeenCalledWith(undefined);
    });

    it("should pass prefix to use case", async () => {
      mockGetDlqListUseCase.invoke.mockResolvedValue({
        items: ["dlq:menu:1"],
      });

      await controller.getList("dlq:menu:");

      expect(mockGetDlqListUseCase.invoke).toHaveBeenCalledWith("dlq:menu:");
    });
  });

  describe("getByKey", () => {
    it("should return DLQ detail DTO with key and payload", async () => {
      const payload = { eventType: "MESSAGE", data: "test" };
      mockGetDlqDetailUseCase.invoke.mockResolvedValue({ item: payload });

      const result = await controller.getByKey("dlq:menu:1");

      expect(result.key).toBe("dlq:menu:1");
      expect(result.payload).toEqual(payload);
      expect(mockGetDlqDetailUseCase.invoke).toHaveBeenCalledWith("dlq:menu:1");
    });
  });

  describe("retry", () => {
    it("should return retry result DTO", async () => {
      mockRetryDlqUseCase.invoke.mockResolvedValue({
        message: "재시도 성공",
      });

      const result = await controller.retry("dlq:menu:1");

      expect(result.message).toBe("재시도 성공");
      expect(mockRetryDlqUseCase.invoke).toHaveBeenCalledWith("dlq:menu:1");
    });
  });
});
