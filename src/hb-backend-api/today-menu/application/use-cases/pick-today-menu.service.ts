import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PickTodayMenuUseCase } from "../ports/in/pick-today-menu.use-case";
import { TodayMenuId } from "../../domain/vo/today-menu.vo";
import { DIToken } from "../../../../shared/di/token.di";
import { TodayMenuQueryPort } from "../ports/out/today-menu-query.port";
import { TodayMenuRelationEntity } from "../../domain/entity/today-menu-with-relations.entity";
import { MenuRecommendationRelationEntity } from "../../../menu-recommendation/domain/entity/menu-recommendation-with-relations.entity";
import { MenuRecommendationId } from "../../../menu-recommendation/domain/vo/menu-recommendation-id.vo";
import { PickTodayMenuCommand } from "../command/pick-today-menu.command";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TodayMenuPersistencePort } from "../ports/out/today-menu-persistence.port";
import { UpsertTodayMenuCommand } from "../command/upsert-today-menu.command";
import { UpsertTodayMenuEntity } from "../../domain/entity/upsert-today-menu.entity";
import { DateHelper } from "../../../../shared/date/date.helper";
import { YearMonthDayString } from "../../../daily-todo/domain/vo/year-month-day-string.vo";

@Injectable()
export class PickTodayMenuService implements PickTodayMenuUseCase {
  constructor(
    @Inject(DIToken.TodayMenuModule.TodayMenuQueryPort)
    private readonly todayMenuQueryPort: TodayMenuQueryPort,
    @Inject(DIToken.TodayMenuModule.TodayMenuPersistencePort)
    private readonly todayMenuPersistencePort: TodayMenuPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    command: PickTodayMenuCommand,
  ): Promise<MenuRecommendationId> {
    const menu = await this.getBy(command.getId);
    this.checkCandidates(menu.getCandidates);

    const candidates = menu.getCandidates;
    const pickedMenuId = this.pickCandidate(
      candidates,
      this.getRandomIndex(candidates.length),
    );
    await this.upsertRecommendedMenu(
      UpsertTodayMenuCommand.of(
        candidates.map((item) => item.getId),
        pickedMenuId,
        YearMonthDayString.fromString(DateHelper.formatDate()),
        command.getId,
      ),
    );

    return pickedMenuId;
  }

  private async getBy(id: TodayMenuId): Promise<TodayMenuRelationEntity> {
    return this.todayMenuQueryPort.findById(id);
  }

  private checkCandidates(candidates: MenuRecommendationRelationEntity[]) {
    if (candidates.length === 0) {
      throw new BadRequestException("추첨할 메뉴가 없어요.");
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

  private async upsertRecommendedMenu(
    command: UpsertTodayMenuCommand,
  ): Promise<void> {
    await this.todayMenuPersistencePort.upsert(
      UpsertTodayMenuEntity.from(command),
    );
  }
}
