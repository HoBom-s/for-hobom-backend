import { Test, TestingModule } from "@nestjs/testing";
import { HealthCheckService, MongooseHealthIndicator } from "@nestjs/terminus";
import { HealthController } from "../../../../../src/hb-backend-api/health/adapters/in/health.controller";

describe("HealthController", () => {
  let controller: HealthController;
  const mockHealthCheckService = { check: jest.fn() };
  const mockMongooseHealthIndicator = { pingCheck: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: MongooseHealthIndicator,
          useValue: mockMongooseHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  describe("live", () => {
    it("should return 'OK'", () => {
      const result = controller.live();

      expect(result).toBe("OK");
    });
  });

  describe("ready", () => {
    it("should call health.check with mongoose pingCheck", async () => {
      const healthResult = {
        status: "ok",
        details: { mongodb: { status: "up" } },
      };
      mockHealthCheckService.check.mockResolvedValue(healthResult);

      const result = await controller.ready();

      expect(result).toEqual(healthResult);
      expect(mockHealthCheckService.check).toHaveBeenCalledTimes(1);

      // Verify the indicator function passed to check() calls mongoose.pingCheck("mongodb")
      const indicatorFns = mockHealthCheckService.check.mock.calls[0][0];
      expect(indicatorFns).toHaveLength(1);

      indicatorFns[0]();
      expect(mockMongooseHealthIndicator.pingCheck).toHaveBeenCalledWith(
        "mongodb",
      );
    });

    it("should propagate error when health check fails", async () => {
      const error = new Error("mongodb ping failed");
      mockHealthCheckService.check.mockRejectedValue(error);

      await expect(controller.ready()).rejects.toThrow("mongodb ping failed");
    });
  });
});
