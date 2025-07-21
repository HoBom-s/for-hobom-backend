import { Inject, Injectable } from "@nestjs/common";
import { FutureMessageQueryPort } from "../../domain/ports/out/future-message-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { FutureMessageQueryRepository } from "../../infra/repositorries/future-message-query.repository";
import { FutureMessageQueryResult } from "../../domain/ports/out/future-message-query.result";
import { SendStatus } from "../../domain/model/send-status.enum";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Injectable()
export class FutureMessageQueryAdapter implements FutureMessageQueryPort {
  constructor(
    @Inject(DIToken.FutureMessageModule.FutureMessageQueryRepository)
    private readonly futureMessageQueryRepository: FutureMessageQueryRepository,
  ) {}

  public async findAllBySendStatusWithoutSenderId(
    sendStatus: SendStatus,
  ): Promise<FutureMessageQueryResult[]> {
    const foundItems =
      await this.futureMessageQueryRepository.findAllBySendStatusWithoutSenderId(
        sendStatus,
      );

    return foundItems.map(FutureMessageQueryResult.from);
  }

  public async findAllBySendStatus(
    sendStatus: SendStatus,
    senderId: UserId,
  ): Promise<FutureMessageQueryResult[]> {
    const foundItems =
      await this.futureMessageQueryRepository.findAllBySendStatus(
        sendStatus,
        senderId,
      );

    return foundItems.map(FutureMessageQueryResult.from);
  }

  public async findById(
    id: FutureMessageId,
  ): Promise<FutureMessageQueryResult> {
    const found = await this.futureMessageQueryRepository.findById(id);

    return FutureMessageQueryResult.from(found);
  }
}
