import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LlmExamPort } from "../../domain/ports/out/llm-exam.port";
import { TraceContext } from "../../../../shared/trace/trace.context";

const REQUEST_TIMEOUT_MS = 180_000;

@Injectable()
export class LlmExamAdapter implements LlmExamPort {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly traceContext: TraceContext,
  ) {
    const host = this.configService.get<string>(
      "HOBOM_LLM_REST_HOST",
      "localhost",
    );
    const port = this.configService.get<string>("HOBOM_LLM_REST_PORT", "3000");
    this.baseUrl = `http://${host}:${port}`;
    this.apiKey = this.configService.getOrThrow<string>("HOBOM_LLM_API_KEY");
  }

  public async generateExam(request: {
    articles: { articleNo: string; articleTitle: string; content: string }[];
    subject: string;
    questionCount: number;
  }): Promise<{
    questions: {
      subject: string;
      type: string;
      question: string;
      choices: string[];
      answer: string;
      explanation: string;
    }[];
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const traceId = this.traceContext.getTraceId();
      const response = await fetch(`${this.baseUrl}/api/v1/generate-exam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          ...(traceId ? { "x-hobom-trace-id": traceId } : {}),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new BadGatewayException(
          `LLM 모의고사 생성 호출에 실패했어요. status=${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new BadGatewayException(
          `LLM 모의고사 생성 호출이 ${REQUEST_TIMEOUT_MS}ms 내에 응답하지 않았어요.`,
        );
      }
      throw new BadGatewayException(
        "LLM 서비스에 연결할 수 없어요. 서비스가 실행 중인지 확인해 주세요.",
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
