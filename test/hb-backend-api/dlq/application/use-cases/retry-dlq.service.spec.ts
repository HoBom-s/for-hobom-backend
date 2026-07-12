import { Test, TestingModule } from "@nestjs/testing";
import { RetryDlqService } from "../../../../../src/hb-backend-api/dlq/application/use-cases/retry-dlq.service";
import { DIToken } from "../../../../../src/shared/di/token.di";

describe("RetryDlqService", () => {
  let service: RetryDlqService;
  const mockDlqProxyPort = {
    getList: jest.fn(),
    getByKey: jest.fn(),
    retry: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryDlqService,
        {
          provide: DIToken.DlqModule.DlqProxyPort,
          useValue: mockDlqProxyPort,
        },
      ],
    }).compile();

    service = module.get(RetryDlqService);
  });

  it("should delegate to DlqProxyPort.retry", async () => {
    mockDlqProxyPort.retry.mockResolvedValue({ message: "재시도 성공" });

    const result = await service.invoke("dlq:menu:1");

    expect(mockDlqProxyPort.retry).toHaveBeenCalledWith("dlq:menu:1");
    expect(result.message).toBe("재시도 성공");
  });
});
