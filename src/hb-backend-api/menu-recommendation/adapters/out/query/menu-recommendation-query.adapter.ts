import { Inject, Injectable } from "@nestjs/common";
import { MenuRecommendationQueryPort } from "../../../application/ports/out/menu-recommendation-query.port";
import {
  MenuRecommendationRelationEntity,
  MenuRecommendationWithRelationsEntity,
  RegisterPerson,
} from "src/hb-backend-api/menu-recommendation/domain/entity/menu-recommendation-with-relations.entity";
import { DIToken } from "../../../../../shared/di/token.di";
import { MenuRecommendationRepository } from "../../../infra/menu-recommendation.repository";
import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { MenuRecommendationId } from "../../../domain/vo/menu-recommendation-id.vo";

@Injectable()
export class MenuRecommendationQueryAdapter
  implements MenuRecommendationQueryPort
{
  constructor(
    @Inject(DIToken.MenuRecommendationModule.MenuRecommendationRepository)
    private readonly menuRecommendationRepository: MenuRecommendationRepository,
  ) {}

  public async findAll(): Promise<MenuRecommendationRelationEntity[]> {
    const menuRecommendations = await this.getBy();
    return this.convertToRelationEntity(menuRecommendations);
  }

  private async getBy(): Promise<MenuRecommendationWithRelationsEntity[]> {
    return await this.menuRecommendationRepository.findAll();
  }

  private convertToRelationEntity(
    menuRecommendations: MenuRecommendationWithRelationsEntity[],
  ): MenuRecommendationRelationEntity[] {
    return menuRecommendations.map((item) =>
      MenuRecommendationRelationEntity.of(
        MenuRecommendationId.fromString(item.id),
        item.name,
        item.menuKind,
        item.timeOfMeal,
        item.foodType,
        RegisterPerson.of(
          UserId.fromString(item.registerPerson.id),
          item.registerPerson.username,
          item.registerPerson.nickname,
        ),
      ),
    );
  }
}
