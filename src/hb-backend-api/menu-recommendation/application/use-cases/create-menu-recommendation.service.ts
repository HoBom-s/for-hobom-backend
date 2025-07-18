import { Inject, Injectable } from "@nestjs/common";
import { CreateMenuRecommendationUseCase } from "../../domain/ports/in/create-menu-recommendation.use-case";
import { MenuRecommendationPersistencePort } from "../../domain/ports/out/menu-recommendation-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";
import { CreateMenuRecommendationCommand } from "../../domain/ports/out/create-menu-recommendation.command";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class CreateMenuRecommendationService
  implements CreateMenuRecommendationUseCase
{
  constructor(
    @Inject(DIToken.MenuRecommendationModule.MenuRecommendationPersistencePort)
    private readonly menuRecommendationPersistencePort: MenuRecommendationPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(command: CreateMenuRecommendationCommand): Promise<void> {
    await this.save(command);
  }

  private async save(command: CreateMenuRecommendationCommand): Promise<void> {
    await this.menuRecommendationPersistencePort.save(command.toEntity());
  }
}
