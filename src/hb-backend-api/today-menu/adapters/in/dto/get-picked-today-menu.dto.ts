import { MenuRecommendationId } from "../../../../menu-recommendation/domain/vo/menu-recommendation-id.vo";
import { ApiProperty } from "@nestjs/swagger";

export class GetPickedTodayMenuDto {
  @ApiProperty({ type: String })
  recommendedMenuId: string;

  constructor(recommendedMenuId: MenuRecommendationId) {
    this.recommendedMenuId = recommendedMenuId.toString();
  }

  public static of(
    recommendedMenuId: MenuRecommendationId,
  ): GetPickedTodayMenuDto {
    return new GetPickedTodayMenuDto(recommendedMenuId);
  }
}
