import { Inject, Injectable } from "@nestjs/common";
import { RetryDlqUseCase } from "../../domain/ports/in/retry-dlq.use-case";
import { DlqProxyPort } from "../../domain/ports/out/dlq-proxy.port";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class RetryDlqService implements RetryDlqUseCase {
  constructor(
    @Inject(DIToken.DlqModule.DlqProxyPort)
    private readonly dlqProxyPort: DlqProxyPort,
  ) {}

  public async invoke(key: string): Promise<{ message: string }> {
    return this.dlqProxyPort.retry(key);
  }
}
