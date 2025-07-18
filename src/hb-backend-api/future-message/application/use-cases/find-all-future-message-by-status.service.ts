import { Inject, Injectable } from "@nestjs/common";
import { FindAllFutureMessageByStatusUseCase } from "../../domain/ports/in/find-all-future-message-by-status.use-case";
import { SendStatus } from "../../domain/model/send-status.enum";
import { FutureMessageQueryResult } from "../../domain/ports/out/future-message-query.result";
import { DIToken } from "../../../../shared/di/token.di";
import { FutureMessageQueryPort } from "../../domain/ports/out/future-message-query.port";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Injectable()
export class FindAllFutureMessageByStatusService
  implements FindAllFutureMessageByStatusUseCase
{
  constructor(
    @Inject(DIToken.FutureMessageModule.FutureMessageQueryPort)
    private readonly futureMessageQueryPort: FutureMessageQueryPort,
  ) {}

  public async invoke(
    status: SendStatus,
    senderId: UserId,
  ): Promise<FutureMessageQueryResult[]> {
    return await this.findAll(status, senderId);
  }

  private async findAll(
    status: SendStatus,
    senderId: UserId,
  ): Promise<FutureMessageQueryResult[]> {
    return await this.futureMessageQueryPort.findAllBySendStatus(
      status,
      senderId,
    );
  }
}
