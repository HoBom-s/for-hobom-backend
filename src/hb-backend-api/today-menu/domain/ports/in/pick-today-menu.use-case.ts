import { MenuRecommendationId } from "../../../../menu-recommendation/domain/model/menu-recommendation-id.vo";
import { PickTodayMenuCommand } from "../out/pick-today-menu.command";

export interface PickTodayMenuUseCase {
  invoke(command: PickTodayMenuCommand): Promise<MenuRecommendationId>;
}
