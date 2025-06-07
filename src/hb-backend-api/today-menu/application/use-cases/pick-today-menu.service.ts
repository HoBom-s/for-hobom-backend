import { Inject, Injectable } from "@nestjs/common";
import { PickTodayMenuUseCase } from "../ports/in/pick-today-menu.use-case";
import { TodayMenuId } from "../../domain/vo/today-menu.vo";
import { DIToken } from "../../../../shared/di/token.di";
import { TodayMenuQueryPort } from "../ports/out/today-menu-query.port";
import { TodayMenuRelationEntity } from "../../domain/entity/today-menu-with-relations.entity";
import { MenuRecommendationRelationEntity } from "../../../menu-recommendation/domain/entity/menu-recommendation-with-relations.entity";
import { MenuRecommendationId } from "../../../menu-recommendation/domain/vo/menu-recommendation-id.vo";
import { PickTodayMenuCommand } from "../command/pick-today-menu.command";

@Injectable()
export class PickTodayMenuService implements PickTodayMenuUseCase {
  constructor(
    @Inject(DIToken.TodayMenuModule.TodayMenuQueryPort)
    private readonly todayMenuQueryPort: TodayMenuQueryPort,
  ) {}

  public async invoke(
    command: PickTodayMenuCommand,
  ): Promise<MenuRecommendationId> {
    const menu = await this.getBy(command.getId);
    this.checkCandidates(menu.getCandidates);

    const candidates = menu.getCandidates;
    return this.pickCandidate(
      candidates,
      this.getRandomIndex(candidates.length),
    );
  }

  private async getBy(id: TodayMenuId): Promise<TodayMenuRelationEntity> {
    return this.todayMenuQueryPort.findById(id);
  }

  private checkCandidates(candidates: MenuRecommendationRelationEntity[]) {
    if (candidates.length === 0) {
      throw new Error("추첨할 메뉴가 없어요.");
    }
  }

  private pickCandidate(
    candidates: MenuRecommendationRelationEntity[],
    randomIndex: number,
  ): MenuRecommendationId {
    return candidates[randomIndex].getId;
  }

  private getRandomIndex(length: number): number {
    return Math.floor(Math.random() * length);
  }
}
