import { Controller, Inject, UseGuards } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { DIToken } from "../../../../shared/di/token.di";
import { FindLawOutboxByEventTypeAndStatusUseCase } from "../../domain/ports/in/find-law-outbox-by-event-type-and-status.use-case";
import { FindLawOutboxResultDto } from "./find-law-outbox-result.dto";
import { GrpcApiKeyGuard } from "../../../../shared/adapters/in/grpc/guard/grpc-api-key.guard";
import { EventType } from "../../domain/model/event-type.enum";
import { OutboxStatus } from "../../domain/model/outbox-status.enum";

@Controller()
@UseGuards(GrpcApiKeyGuard)
export class FindLawOutboxController {
  constructor(
    @Inject(DIToken.OutboxModule.FindLawOutboxByEventTypeAndStatusUseCase)
    private readonly findLawOutboxByEventTypeAndStatusUseCase: FindLawOutboxByEventTypeAndStatusUseCase,
  ) {}

  @GrpcMethod(
    "FindHoBomLawOutboxController",
    "FindOutboxByEventTypeAndStatusUseCase",
  )
  public async findBy(
    request: { eventType: string; status: string },
  ): Promise<{ items: FindLawOutboxResultDto[] }> {
    const outbox = await this.findLawOutboxByEventTypeAndStatusUseCase.invoke(
      request.eventType as EventType,
      request.status as OutboxStatus,
    );

    return {
      items: outbox.map(FindLawOutboxResultDto.from),
    };
  }
}
