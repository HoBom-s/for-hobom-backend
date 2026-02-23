import {
  ArgumentsHost,
  HttpException,
  NotFoundException,
} from "@nestjs/common";
import { GlobalExceptionFilter } from "../../../../src/shared/adapters/in/rest/filters/global-exception.filter";
import { DiscordWebhookService } from "../../../../src/shared/discord/discord-webhook.service";

describe("GlobalExceptionFilter", () => {
  let filter: GlobalExceptionFilter;
  let discordService: jest.Mocked<DiscordWebhookService>;

  const buildHost = (method = "GET", url = "/test"): ArgumentsHost => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockResponse = { status: mockStatus };
    const mockRequest = { method, url, headers: {} };
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  };

  beforeEach(() => {
    discordService = {
      sendErrorMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DiscordWebhookService>;

    filter = new GlobalExceptionFilter(discordService);
  });

  describe("4xx 에러", () => {
    it("404 NotFoundException은 Discord 알람을 전송하지 않아야 한다", async () => {
      const exception = new NotFoundException("Cannot POST /");
      const host = buildHost("POST", "/");

      await filter.catch(exception, host);

      expect(discordService.sendErrorMessage).not.toHaveBeenCalled();
    });

    it("404 응답으로 status 404를 반환해야 한다", async () => {
      const exception = new NotFoundException("Not Found");
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

      const mockHost = {
        switchToHttp: () => ({
          getRequest: () => ({ method: "GET", url: "/missing", headers: {} }),
          getResponse: () => ({ status: mockStatus }),
        }),
      } as unknown as ArgumentsHost;

      await filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });

    it("401 UnauthorizedException은 Discord 알람을 전송하지 않아야 한다", async () => {
      const exception = new HttpException("Unauthorized", 401);
      const host = buildHost();

      await filter.catch(exception, host);

      expect(discordService.sendErrorMessage).not.toHaveBeenCalled();
    });
  });

  describe("5xx 에러", () => {
    it("500 내부 서버 에러는 Discord 알람을 전송해야 한다", async () => {
      const exception = new Error("Internal server error");
      const host = buildHost();

      await filter.catch(exception, host);

      expect(discordService.sendErrorMessage).toHaveBeenCalledTimes(1);
    });

    it("500 HttpException도 Discord 알람을 전송해야 한다", async () => {
      const exception = new HttpException("Internal error", 500);
      const host = buildHost();

      await filter.catch(exception, host);

      expect(discordService.sendErrorMessage).toHaveBeenCalledTimes(1);
    });
  });
});
