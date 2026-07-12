import { Test, TestingModule } from "@nestjs/testing";
import { BadGatewayException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DlqProxyAdapter } from "../../../../../src/hb-backend-api/dlq/adapters/out/dlq-proxy.adapter";
import { TraceContext } from "../../../../../src/shared/trace/trace.context";

describe("DlqProxyAdapter", () => {
  let adapter: DlqProxyAdapter;
  const mockFetch = jest.fn();
  const mockTraceContext = {
    getTraceId: jest.fn().mockReturnValue("test-trace-id"),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockTraceContext.getTraceId.mockReturnValue("test-trace-id");
    global.fetch = mockFetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DlqProxyAdapter,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: string) => {
              if (key === "HOBOM_EVENT_PROCESSOR_HOST") {
                return "localhost";
              }
              if (key === "HOBOM_EVENT_PROCESSOR_PORT") {
                return "8082";
              }
              return defaultValue;
            }),
          },
        },
        {
          provide: TraceContext,
          useValue: mockTraceContext,
        },
      ],
    }).compile();

    adapter = module.get(DlqProxyAdapter);
  });

  describe("getList", () => {
    it("should call DLQ list endpoint without prefix", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: ["dlq:menu:1", "dlq:menu:2"] }),
      });

      const result = await adapter.getList();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8082/hobom-event-processor/internal/api/v1/dlq",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
          headers: expect.objectContaining({
            "x-hobom-trace-id": "test-trace-id",
          }),
        }),
      );
      expect(result.items).toEqual(["dlq:menu:1", "dlq:menu:2"]);
    });

    it("should call DLQ list endpoint with prefix", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: ["dlq:menu:1"] }),
      });

      await adapter.getList("dlq:menu:");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8082/hobom-event-processor/internal/api/v1/dlq?prefix=dlq%3Amenu%3A",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
          headers: expect.objectContaining({
            "x-hobom-trace-id": "test-trace-id",
          }),
        }),
      );
    });

    it("should throw BadGatewayException when response is not ok", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(adapter.getList()).rejects.toThrow(BadGatewayException);
    });
  });

  describe("getByKey", () => {
    it("should call DLQ detail endpoint", async () => {
      const payload = { eventType: "MESSAGE", data: "test" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ item: payload }),
      });

      const result = await adapter.getByKey("dlq:menu:1");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8082/hobom-event-processor/internal/api/v1/dlq/dlq%3Amenu%3A1",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
          headers: expect.objectContaining({
            "x-hobom-trace-id": "test-trace-id",
          }),
        }),
      );
      expect(result.item).toEqual(payload);
    });

    it("should throw BadGatewayException when response is not ok", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await expect(adapter.getByKey("dlq:menu:1")).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe("retry", () => {
    it("should call DLQ retry endpoint with POST", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: "재시도 성공" }),
      });

      const result = await adapter.retry("dlq:menu:1");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8082/hobom-event-processor/internal/api/v1/dlq/retry/dlq%3Amenu%3A1",
        expect.objectContaining({
          method: "POST",
          signal: expect.any(AbortSignal),
          headers: expect.objectContaining({
            "x-hobom-trace-id": "test-trace-id",
          }),
        }),
      );
      expect(result.message).toBe("재시도 성공");
    });

    it("should throw BadGatewayException when response is not ok", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 502 });

      await expect(adapter.retry("dlq:menu:1")).rejects.toThrow(
        BadGatewayException,
      );
    });

    it("should throw BadGatewayException when fetch fails", async () => {
      mockFetch.mockRejectedValue(new Error("ECONNREFUSED"));

      await expect(adapter.retry("dlq:menu:1")).rejects.toThrow(
        BadGatewayException,
      );
    });

    it("should throw BadGatewayException with timeout message on AbortError", async () => {
      mockFetch.mockRejectedValue(new DOMException("Aborted", "AbortError"));

      await expect(adapter.retry("dlq:menu:1")).rejects.toThrow("10000ms");
    });
  });

  describe("fetch (traceId header)", () => {
    it("should not send trace header when traceId is empty", async () => {
      mockTraceContext.getTraceId.mockReturnValue("");

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await adapter.getList();

      const headers = mockFetch.mock.calls[0][1].headers as Record<
        string,
        string
      >;
      expect(headers["x-hobom-trace-id"]).toBeUndefined();
    });
  });

  describe("fetch (api-key header)", () => {
    it("should send x-api-key header when HOBOM_EVENT_PROCESSOR_API_KEY is set", async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DlqProxyAdapter,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue: string) => {
                if (key === "HOBOM_EVENT_PROCESSOR_API_KEY") {
                  return "test-api-key";
                }
                return defaultValue;
              }),
            },
          },
          { provide: TraceContext, useValue: mockTraceContext },
        ],
      }).compile();

      const adapterWithApiKey = module.get(DlqProxyAdapter);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await adapterWithApiKey.getList();

      const headers = mockFetch.mock.calls[0][1].headers as Record<
        string,
        string
      >;
      expect(headers["x-api-key"]).toBe("test-api-key");
    });

    it("should not send x-api-key header when HOBOM_EVENT_PROCESSOR_API_KEY is empty", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await adapter.getList();

      const headers = mockFetch.mock.calls[0][1].headers as Record<
        string,
        string
      >;
      expect(headers["x-api-key"]).toBeUndefined();
    });
  });
});
