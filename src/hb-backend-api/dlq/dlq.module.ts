import { Module } from "@nestjs/common";
import { DIToken } from "../../shared/di/token.di";
import { TraceContext } from "../../shared/trace/trace.context";
import { DlqController } from "./adapters/in/dlq.controller";
import { DlqProxyAdapter } from "./adapters/out/dlq-proxy.adapter";
import { GetDlqListService } from "./application/use-cases/get-dlq-list.service";
import { GetDlqDetailService } from "./application/use-cases/get-dlq-detail.service";
import { RetryDlqService } from "./application/use-cases/retry-dlq.service";

@Module({
  controllers: [DlqController],
  providers: [
    TraceContext,
    {
      provide: DIToken.DlqModule.DlqProxyPort,
      useClass: DlqProxyAdapter,
    },
    {
      provide: DIToken.DlqModule.GetDlqListUseCase,
      useClass: GetDlqListService,
    },
    {
      provide: DIToken.DlqModule.GetDlqDetailUseCase,
      useClass: GetDlqDetailService,
    },
    {
      provide: DIToken.DlqModule.RetryDlqUseCase,
      useClass: RetryDlqService,
    },
  ],
})
export class DlqModule {}
