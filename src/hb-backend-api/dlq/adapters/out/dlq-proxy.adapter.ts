import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DlqProxyPort } from "../../domain/ports/out/dlq-proxy.port";
import { TraceContext } from "../../../../shared/trace/trace.context";

const REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class DlqProxyAdapter implements DlqProxyPort {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly traceContext: TraceContext,
  ) {
    const host = this.configService.get<string>(
      "HOBOM_EVENT_PROCESSOR_HOST",
      "localhost",
    );
    const port = this.configService.get<string>(
      "HOBOM_EVENT_PROCESSOR_PORT",
      "8082",
    );
    this.baseUrl = `http://${host}:${port}/hobom-event-processor/internal/api/v1`;
    this.apiKey = this.configService.get<string>(
      "HOBOM_EVENT_PROCESSOR_API_KEY",
      "",
    );
  }

  public async getList(prefix?: string): Promise<{ items: string[] }> {
    const url = prefix
      ? `${this.baseUrl}/dlq?prefix=${encodeURIComponent(prefix)}`
      : `${this.baseUrl}/dlq`;

    const response = await this.fetch(url);

    if (!response.ok) {
      throw new BadGatewayException(
        `DLQ 목록 조회에 실패했어요. status=${response.status}`,
      );
    }

    return response.json() as Promise<{ items: string[] }>;
  }

  public async getByKey(
    key: string,
  ): Promise<{ item: Record<string, unknown> }> {
    const response = await this.fetch(
      `${this.baseUrl}/dlq/${encodeURIComponent(key)}`,
    );

    if (!response.ok) {
      throw new BadGatewayException(
        `DLQ 단건 조회에 실패했어요. status=${response.status}`,
      );
    }

    return response.json() as Promise<{ item: Record<string, unknown> }>;
  }

  public async retry(key: string): Promise<{ message: string }> {
    const response = await this.fetch(
      `${this.baseUrl}/dlq/retry/${encodeURIComponent(key)}`,
      { method: "POST" },
    );

    if (!response.ok) {
      throw new BadGatewayException(
        `DLQ 재시도에 실패했어요. status=${response.status}`,
      );
    }

    return response.json() as Promise<{ message: string }>;
  }

  private async fetch(url: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const traceId = this.traceContext.getTraceId();

    try {
      return await fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          ...(traceId ? { "x-hobom-trace-id": traceId } : {}),
          ...(this.apiKey ? { "x-api-key": this.apiKey } : {}),
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new BadGatewayException(
          `event-processor 호출이 ${REQUEST_TIMEOUT_MS}ms 내에 응답하지 않았어요.`,
        );
      }
      throw new BadGatewayException(
        "event-processor에 연결할 수 없어요. 서비스가 실행 중인지 확인해 주세요.",
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
