import {
  ArgumentsHost,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { GlobalExceptionFilter } from "src/shared/adapters/in/rest/filters/global-exception.filter";
import { DiscordWebhookService } from "src/shared/discord/discord-webhook.service";

describe("GlobalExceptionFilter", () => {
  let filter: GlobalExceptionFilter;
  let mockDiscord: jest.Mocked<Pick<DiscordWebhookService, "sendErrorMessage">>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockRequest: {
    method: string;
    url: string;
    headers: Record<string, unknown>;
  };

  beforeEach(() => {
    mockDiscord = { sendErrorMessage: jest.fn().mockResolvedValue(undefined) };
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRequest = { method: "POST", url: "/api/v1/test", headers: {} };

    filter = new GlobalExceptionFilter(
      mockDiscord as unknown as DiscordWebhookService,
    );
  });

  function buildHost(): ArgumentsHost {
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({ status: mockStatus }),
      }),
    } as unknown as ArgumentsHost;
  }

  it("HttpException 4xx → status 404, Discord 호출하지 않는다", async () => {
    const exception = new NotFoundException("리소스를 찾을 수 없어요");

    await filter.catch(exception, buildHost());

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        path: "/api/v1/test",
        message: exception.getResponse(),
      }),
    );
    expect(mockDiscord.sendErrorMessage).not.toHaveBeenCalled();
  });

  it("HttpException 5xx → status 500, Discord에 JSON.stringify body 전송", async () => {
    const exception = new InternalServerErrorException("서버 내부 오류");

    await filter.catch(exception, buildHost());

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockDiscord.sendErrorMessage).toHaveBeenCalledTimes(1);

    const [title, body] = mockDiscord.sendErrorMessage.mock.calls[0];
    expect(title).toContain("[500]");
    expect(title).toContain("POST");
    expect(title).toContain("/api/v1/test");
    expect(body).toContain(JSON.stringify(exception.getResponse(), null, 2));
  });

  it("Non-HttpException (Error) → status 500, message 'Internal server error', Discord에 String(exception) 전송", async () => {
    const exception = new Error("unexpected failure");

    await filter.catch(exception, buildHost());

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: "Internal server error",
      }),
    );
    expect(mockDiscord.sendErrorMessage).toHaveBeenCalledTimes(1);

    const [, body] = mockDiscord.sendErrorMessage.mock.calls[0];
    expect(body).toContain(String(exception));
  });

  it("Non-HttpException (string) → status 500, Discord에 해당 문자열 전송", async () => {
    const exception = "raw string error";

    await filter.catch(exception, buildHost());

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: "Internal server error",
      }),
    );
    expect(mockDiscord.sendErrorMessage).toHaveBeenCalledTimes(1);

    const [, body] = mockDiscord.sendErrorMessage.mock.calls[0];
    expect(body).toContain("raw string error");
  });

  it("traceId 헤더가 있으면 Discord 메시지에 TraceId를 포함한다", async () => {
    mockRequest.headers = { traceId: "abc-trace-123" };
    const exception = new Error("server crash");

    await filter.catch(exception, buildHost());

    const [title] = mockDiscord.sendErrorMessage.mock.calls[0];
    expect(title).toContain("TraceId: abc-trace-123");
  });

  it("traceId 헤더가 없으면 Discord 메시지에 TraceId를 포함하지 않는다", async () => {
    mockRequest.headers = {};
    const exception = new Error("server crash");

    await filter.catch(exception, buildHost());

    const [title] = mockDiscord.sendErrorMessage.mock.calls[0];
    expect(title).not.toContain("TraceId");
  });
});
