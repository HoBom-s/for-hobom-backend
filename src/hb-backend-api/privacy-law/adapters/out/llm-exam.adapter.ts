import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LlmExamPort } from "../../domain/ports/out/llm-exam.port";

@Injectable()
export class LlmExamAdapter implements LlmExamPort {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
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
    const response = await fetch(`${this.baseUrl}/api/v1/generate-exam`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(
        `LLM 모의고사 생성 호출에 실패했어요. status=${response.status}`,
      );
    }

    return response.json();
  }
}
