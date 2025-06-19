import { Inject, Injectable } from "@nestjs/common";
import { MenuRecommendationPersistencePort } from "../../../application/ports/out/menu-recommendation-persistence.port";
import { MenuRecommendationRepository } from "../../../infra/repositories/menu-recommendation.repository";
import { DIToken } from "../../../../../shared/di/token.di";
import { CreateMenuRecommendationEntity } from "../../../domain/entity/create-menu-recommendation.entity";

@Injectable()
export class MenuRecommendationPersistenceAdapter
  implements MenuRecommendationPersistencePort
{
  constructor(
    @Inject(DIToken.MenuRecommendationModule.MenuRecommendationRepository)
    private readonly menuRecommendationRepository: MenuRecommendationRepository,
  ) {}

  public async save(entity: CreateMenuRecommendationEntity): Promise<void> {
    await this.menuRecommendationRepository.save(entity);
  }
}
