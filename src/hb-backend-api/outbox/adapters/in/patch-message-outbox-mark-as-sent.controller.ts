import { Controller, Inject } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { DIToken } from "../../../../shared/di/token.di";
import { PatchOutboxMarkAsSentUseCase } from "../../domain/ports/in/patch-outbox-mark-as-sent.use-case";
import { PatchMessageOutboxRequest } from "./patch-message-outbox-request";
import { EventId } from "../../domain/model/event-id.vo";

@Controller()
export class PatchMessageOutboxMarkAsSentController {
  constructor(
    @Inject(DIToken.OutboxModule.PatchOutboxMarkAsSentUseCase)
    private readonly patchOutboxMarkAsSentUseCase: PatchOutboxMarkAsSentUseCase,
  ) {}

  @GrpcMethod("PatchOutboxController", "PatchOutboxMarkAsSentUseCase")
  public async markAsSent(request: PatchMessageOutboxRequest): Promise<void> {
    const eventId = EventId.fromString(request.eventId);
    await this.patchOutboxMarkAsSentUseCase.invoke(eventId);
  }
}
