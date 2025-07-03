import { Controller, Inject } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { DIToken } from "../../../../../shared/di/token.di";
import { FindLogOutboxByEventTypeAndStatusUseCase } from "../../../application/ports/in/find-log-outbox-by-event-type-and-status.use-case";
import { FindLogOutboxResultDto } from "../dto/find-log-outbox-result.dto";
import { FindLogOutboxDto } from "../dto/find-log-outbox.dto";

@Controller()
export class FindLogOutboxController {
  constructor(
    @Inject(DIToken.OutboxModule.FindLogOutboxByEventTypeAndStatusUseCase)
    private readonly findLogOutboxByEventTypeAndStatusUseCase: FindLogOutboxByEventTypeAndStatusUseCase,
  ) {}

  @GrpcMethod(
    "FindHoBomLogOutboxController",
    "FindLogOutboxByEventTypeAndStatusUseCase",
  )
  public async findBy(
    request: FindLogOutboxDto,
  ): Promise<{ items: FindLogOutboxResultDto[] }> {
    const outbox = await this.findLogOutboxByEventTypeAndStatusUseCase.invoke(
      request.eventType,
      request.status,
    );

    return {
      items: outbox.map(FindLogOutboxResultDto.from),
    };
  }
}
