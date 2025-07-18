import { Inject, Injectable } from "@nestjs/common";
import { FindFutureMessageByIdUseCase } from "../../domain/ports/in/find-future-message-by-id.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { FutureMessageQueryPort } from "../../domain/ports/out/future-message-query.port";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { FutureMessageQueryResult } from "../../domain/ports/out/future-message-query.result";

@Injectable()
export class FindFutureMessageByIdService
  implements FindFutureMessageByIdUseCase
{
  constructor(
    @Inject(DIToken.FutureMessageModule.FutureMessageQueryPort)
    private readonly futureMessageQueryPort: FutureMessageQueryPort,
  ) {}

  public async invoke(id: FutureMessageId): Promise<FutureMessageQueryResult> {
    return await this.findById(id);
  }

  private async findById(
    id: FutureMessageId,
  ): Promise<FutureMessageQueryResult> {
    return await this.futureMessageQueryPort.findById(id);
  }
}
