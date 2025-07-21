import { Controller, Inject } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { DIToken } from "../../../../shared/di/token.di";
import { FindOutboxByEventTypeAndStatusUseCase } from "../../domain/ports/in/find-outbox-by-event-type-and-status.use-case";
import { FindTodayMenuOutboxDtoType } from "./find-message-outbox.dto";
import { FindMessageOutboxResultDto } from "./find-message-outbox-result.dto";

@Controller()
export class FindMessageOutboxController {
  constructor(
    @Inject(DIToken.OutboxModule.FindOutboxByEventTypeAndStatusUseCase)
    private readonly findOutboxByEventTypeAndStatusUseCase: FindOutboxByEventTypeAndStatusUseCase,
  ) {}

  @GrpcMethod(
    "FindHoBomMessageOutboxController",
    "FindOutboxByEventTypeAndStatusUseCase",
  )
  public async findBy(
    request: FindTodayMenuOutboxDtoType,
  ): Promise<{ items: FindMessageOutboxResultDto[] }> {
    const outbox = await this.findOutboxByEventTypeAndStatusUseCase.invoke(
      request.eventType,
      request.status,
    );

    return {
      items: outbox.map(FindMessageOutboxResultDto.from),
    };
  }
}
