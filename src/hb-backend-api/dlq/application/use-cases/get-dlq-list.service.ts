import { Inject, Injectable } from "@nestjs/common";
import { GetDlqListUseCase } from "../../domain/ports/in/get-dlq-list.use-case";
import { DlqProxyPort } from "../../domain/ports/out/dlq-proxy.port";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class GetDlqListService implements GetDlqListUseCase {
  constructor(
    @Inject(DIToken.DlqModule.DlqProxyPort)
    private readonly dlqProxyPort: DlqProxyPort,
  ) {}

  public async invoke(prefix?: string): Promise<{ items: string[] }> {
    return this.dlqProxyPort.getList(prefix);
  }
}
