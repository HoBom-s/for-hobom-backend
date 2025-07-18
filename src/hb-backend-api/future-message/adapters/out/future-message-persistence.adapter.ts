import { Inject, Injectable } from "@nestjs/common";
import { FutureMessagePersistencePort } from "../../domain/ports/out/future-message-persistence.port";
import { CreateFutureMessageEntity } from "../../domain/model/create-future-message.entity";
import { FutureMessageDomain } from "../../domain/model/future-message.domain";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { DIToken } from "../../../../shared/di/token.di";
import { FutureMessagePersistenceRepository } from "../../infra/repositorries/future-message-persistence.repository";

@Injectable()
export class FutureMessagePersistenceAdapter
  implements FutureMessagePersistencePort
{
  constructor(
    @Inject(DIToken.FutureMessageModule.FutureMessagePersistenceRepository)
    private readonly futureMessagePersistenceRepository: FutureMessagePersistenceRepository,
  ) {}

  public async load(id: FutureMessageId): Promise<FutureMessageDomain> {
    return await this.futureMessagePersistenceRepository.load(id);
  }

  public async save(entity: CreateFutureMessageEntity): Promise<void> {
    await this.futureMessagePersistenceRepository.save(entity);
  }
}
