import { Test, TestingModule } from "@nestjs/testing";
import { GetDlqListService } from "../../../../../src/hb-backend-api/dlq/application/use-cases/get-dlq-list.service";
import { DIToken } from "../../../../../src/shared/di/token.di";

describe("GetDlqListService", () => {
  let service: GetDlqListService;
  const mockDlqProxyPort = {
    getList: jest.fn(),
    getByKey: jest.fn(),
    retry: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDlqListService,
        {
          provide: DIToken.DlqModule.DlqProxyPort,
          useValue: mockDlqProxyPort,
        },
      ],
    }).compile();

    service = module.get(GetDlqListService);
  });

  it("should delegate to DlqProxyPort.getList", async () => {
    mockDlqProxyPort.getList.mockResolvedValue({
      items: ["dlq:menu:1"],
    });

    const result = await service.invoke("dlq:menu:");

    expect(mockDlqProxyPort.getList).toHaveBeenCalledWith("dlq:menu:");
    expect(result.items).toEqual(["dlq:menu:1"]);
  });

  it("should pass undefined when no prefix", async () => {
    mockDlqProxyPort.getList.mockResolvedValue({ items: [] });

    await service.invoke();

    expect(mockDlqProxyPort.getList).toHaveBeenCalledWith(undefined);
  });
});
