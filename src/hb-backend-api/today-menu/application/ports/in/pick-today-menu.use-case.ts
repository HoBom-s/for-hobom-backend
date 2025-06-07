import { MenuRecommendationId } from "../../../../menu-recommendation/domain/vo/menu-recommendation-id.vo";
import { PickTodayMenuCommand } from "../../command/pick-today-menu.command";

export interface PickTodayMenuUseCase {
  invoke(command: PickTodayMenuCommand): Promise<MenuRecommendationId>;
}
