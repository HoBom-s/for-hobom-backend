import { Controller, Inject } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { DIToken } from "../../../../../shared/di/token.di";
import { FindOutboxByEventTypeAndStatusUseCase } from "../../../application/ports/in/find-outbox-by-event-type-and-status.use-case";
import { FindTodayMenuOutboxDtoType } from "../dto/find-today-menu-outbox.dto";
import { FindTodayMenuOutboxResultDto } from "../dto/find-today-menu-outbox-result.dto";

@Controller()
export class FindTodayMenuOutboxController {
  constructor(
    @Inject(DIToken.OutboxModule.FindOutboxByEventTypeAndStatusUseCase)
    private readonly findOutboxByEventTypeAndStatusUseCase: FindOutboxByEventTypeAndStatusUseCase,
  ) {}

  @GrpcMethod(
    "FindTodayMenuOutboxController",
    "FindOutboxByEventTypeAndStatusUseCase",
  )
  public async findBy(
    request: FindTodayMenuOutboxDtoType,
  ): Promise<{ items: FindTodayMenuOutboxResultDto[] }> {
    const outbox = await this.findOutboxByEventTypeAndStatusUseCase.invoke(
      request.eventType,
      request.status,
    );

    return {
      items: outbox.map(FindTodayMenuOutboxResultDto.from),
    };
  }
}
