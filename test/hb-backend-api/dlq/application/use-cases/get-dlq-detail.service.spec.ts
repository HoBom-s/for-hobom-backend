import { Test, TestingModule } from "@nestjs/testing";
import { GetDlqDetailService } from "../../../../../src/hb-backend-api/dlq/application/use-cases/get-dlq-detail.service";
import { DIToken } from "../../../../../src/shared/di/token.di";

describe("GetDlqDetailService", () => {
  let service: GetDlqDetailService;
  const mockDlqProxyPort = {
    getList: jest.fn(),
    getByKey: jest.fn(),
    retry: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDlqDetailService,
        {
          provide: DIToken.DlqModule.DlqProxyPort,
          useValue: mockDlqProxyPort,
        },
      ],
    }).compile();

    service = module.get(GetDlqDetailService);
  });

  it("should delegate to DlqProxyPort.getByKey", async () => {
    const payload = { eventType: "MESSAGE", data: "test" };
    mockDlqProxyPort.getByKey.mockResolvedValue({ item: payload });

    const result = await service.invoke("dlq:menu:1");

    expect(mockDlqProxyPort.getByKey).toHaveBeenCalledWith("dlq:menu:1");
    expect(result.item).toEqual(payload);
  });
});
