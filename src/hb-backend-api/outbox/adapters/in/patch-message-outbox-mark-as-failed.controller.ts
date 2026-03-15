import { Controller, Inject, UseGuards } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { DIToken } from "../../../../shared/di/token.di";
import { PatchOutboxMarkAsFailedUseCase } from "../../domain/ports/in/patch-outbox-mark-as-failed.use-case";
import { PatchMessageOutboxFailedRequest } from "./patch-message-outbox-failed-request";
import { EventId } from "../../domain/model/event-id.vo";
import { GrpcApiKeyGuard } from "../../../../shared/adapters/in/grpc/guard/grpc-api-key.guard";

@Controller()
@UseGuards(GrpcApiKeyGuard)
export class PatchMessageOutboxMarkAsFailedController {
  constructor(
    @Inject(DIToken.OutboxModule.PatchOutboxMarkAsFailedUseCase)
    private readonly patchOutboxMarkAsFailedUseCase: PatchOutboxMarkAsFailedUseCase,
  ) {}

  @GrpcMethod("PatchOutboxController", "PatchOutboxMarkAsFailedUseCase")
  public async markAsFailed(
    request: PatchMessageOutboxFailedRequest,
  ): Promise<void> {
    const eventId = EventId.fromString(request.eventId);
    await this.patchOutboxMarkAsFailedUseCase.invoke(
      eventId,
      request.errorMessage,
    );
  }
}
