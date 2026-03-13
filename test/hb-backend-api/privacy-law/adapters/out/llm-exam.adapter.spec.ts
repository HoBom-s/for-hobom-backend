import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { LlmExamAdapter } from "../../../../../src/hb-backend-api/privacy-law/adapters/out/llm-exam.adapter";

describe("LlmExamAdapter", () => {
  let adapter: LlmExamAdapter;
  const mockFetch = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    global.fetch = mockFetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmExamAdapter,
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

    adapter = module.get(LlmExamAdapter);
  });

  const mockRequest = {
    articles: [
      { articleNo: "제15조", articleTitle: "수집·이용", content: "내용" },
    ],
    subject: "개인정보 보호법 총칙",
    questionCount: 5,
  };

  const mockQuestions = [
    {
      subject: "개인정보 보호법 총칙",
      type: "OX",
      question: "테스트 문제",
      choices: [],
      answer: "O",
      explanation: "해설",
    },
  ];

  describe("generateExam", () => {
    it("should call correct URL with API key header", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ questions: mockQuestions }),
      });

      await adapter.generateExam(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/generate-exam",
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

    it("should return parsed questions from response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ questions: mockQuestions }),
      });

      const result = await adapter.generateExam(mockRequest);

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].type).toBe("OX");
      expect(result.questions[0].answer).toBe("O");
    });

    it("should throw when response is not ok", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(adapter.generateExam(mockRequest)).rejects.toThrow(
        "LLM 모의고사 생성 호출에 실패했어요. status=500",
      );
    });

    it("should throw when response is 401", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      });

      await expect(adapter.generateExam(mockRequest)).rejects.toThrow(
        "status=401",
      );
    });

    it("should throw when fetch itself fails", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(adapter.generateExam(mockRequest)).rejects.toThrow(
        "Network error",
      );
    });
  });
});
