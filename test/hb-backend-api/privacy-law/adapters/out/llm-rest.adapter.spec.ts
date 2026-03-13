import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { LlmRestAdapter } from "../../../../../src/hb-backend-api/privacy-law/adapters/out/llm-rest.adapter";

describe("LlmRestAdapter", () => {
  let adapter: LlmRestAdapter;
  const mockFetch = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    global.fetch = mockFetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmRestAdapter,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: string) => {
              if (key === "HOBOM_LLM_REST_HOST") {
                return "localhost";
              }
              if (key === "HOBOM_LLM_REST_PORT") {
                return "3000";
              }
              return defaultValue;
            }),
            getOrThrow: jest.fn().mockReturnValue("test-api-key"),
          },
        },
      ],
    }).compile();

    adapter = module.get(LlmRestAdapter);
  });

  const mockRequest = {
    question: "개인정보 보호법에서 동의가 필요한 경우는?",
    articles: [
      { articleNo: "제15조", articleTitle: "수집·이용", content: "내용" },
    ],
    recentChanges: [
      {
        articleNo: "제15조",
        changeType: "MODIFIED",
        before: "이전",
        after: "이후",
      },
    ],
  };

  describe("ask", () => {
    it("should call correct URL with API key header", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: "답변",
            referencedArticles: ["제15조"],
          }),
      });

      await adapter.ask(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/ask",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "test-api-key",
          },
          body: JSON.stringify(mockRequest),
        }),
      );
    });

    it("should return parsed answer", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: "제15조에 따르면...",
            referencedArticles: ["제15조", "제17조"],
          }),
      });

      const result = await adapter.ask(mockRequest);

      expect(result.answer).toBe("제15조에 따르면...");
      expect(result.referencedArticles).toEqual(["제15조", "제17조"]);
    });

    it("should throw when response is not ok", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
      });

      await expect(adapter.ask(mockRequest)).rejects.toThrow(
        "LLM REST 호출에 실패했어요. status=502",
      );
    });

    it("should throw when fetch fails", async () => {
      mockFetch.mockRejectedValue(new Error("ECONNREFUSED"));

      await expect(adapter.ask(mockRequest)).rejects.toThrow("ECONNREFUSED");
    });
  });
});
