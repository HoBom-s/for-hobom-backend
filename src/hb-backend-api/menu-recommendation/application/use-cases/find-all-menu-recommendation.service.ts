import { Inject, Injectable } from "@nestjs/common";
import { FindAllMenuRecommendationUseCase } from "../../domain/ports/in/find-all-menu-recommendation.use-case";
import { GetMenuRecommendationQueryResult } from "../../domain/ports/out/get-menu-recommendation-query.result";
import { DIToken } from "../../../../shared/di/token.di";
import { MenuRecommendationQueryPort } from "../../domain/ports/out/menu-recommendation-query.port";
import { MenuRecommendationRelationEntity } from "../../domain/model/menu-recommendation-with-relations.entity";

@Injectable()
export class FindAllMenuRecommendationService
  implements FindAllMenuRecommendationUseCase
{
  constructor(
    @Inject(DIToken.MenuRecommendationModule.MenuRecommendationQueryPort)
    private readonly menuRecommendationQueryPort: MenuRecommendationQueryPort,
  ) {}

  public async invoke(): Promise<GetMenuRecommendationQueryResult[]> {
    const menuRecommendations = await this.getBy();
    return menuRecommendations.map(GetMenuRecommendationQueryResult.from);
  }

  private async getBy(): Promise<MenuRecommendationRelationEntity[]> {
    return await this.menuRecommendationQueryPort.findAll();
  }
}
