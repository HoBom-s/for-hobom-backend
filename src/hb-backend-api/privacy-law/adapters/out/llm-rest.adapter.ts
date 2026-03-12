import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LlmPort } from "../../domain/ports/out/llm.port";

@Injectable()
export class LlmRestAdapter implements LlmPort {
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

  public async ask(request: {
    question: string;
    articles: {
      articleNo: string;
      articleTitle: string;
      content: string;
    }[];
    recentChanges: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[];
  }): Promise<{ answer: string; referencedArticles: string[] }> {
    const response = await fetch(`${this.baseUrl}/api/v1/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(
        `LLM REST 호출에 실패했어요. status=${response.status}`,
      );
    }

    return response.json();
  }
}
