import { Inject, Injectable } from "@nestjs/common";
import { GetDlqDetailUseCase } from "../../domain/ports/in/get-dlq-detail.use-case";
import { DlqProxyPort } from "../../domain/ports/out/dlq-proxy.port";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class GetDlqDetailService implements GetDlqDetailUseCase {
  constructor(
    @Inject(DIToken.DlqModule.DlqProxyPort)
    private readonly dlqProxyPort: DlqProxyPort,
  ) {}

  public async invoke(key: string): Promise<{ item: Record<string, unknown> }> {
    return this.dlqProxyPort.getByKey(key);
  }
}
