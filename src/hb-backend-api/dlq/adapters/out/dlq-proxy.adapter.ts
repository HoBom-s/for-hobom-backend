import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DlqProxyPort } from "../../domain/ports/out/dlq-proxy.port";

@Injectable()
export class DlqProxyAdapter implements DlqProxyPort {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>(
      "HOBOM_EVENT_PROCESSOR_HOST",
      "localhost",
    );
    const port = this.configService.get<string>(
      "HOBOM_EVENT_PROCESSOR_PORT",
      "8082",
    );
    this.baseUrl = `http://${host}:${port}/hobom-event-processor/internal/api/v1`;
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
    try {
      return await fetch(url, init);
    } catch {
      throw new BadGatewayException(
        "event-processor에 연결할 수 없어요. 서비스가 실행 중인지 확인해 주세요.",
      );
    }
  }
}
