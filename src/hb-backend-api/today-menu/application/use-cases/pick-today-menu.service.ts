import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PickTodayMenuUseCase } from "../../domain/ports/in/pick-today-menu.use-case";
import { TodayMenuId } from "../../domain/model/today-menu.vo";
import { DIToken } from "../../../../shared/di/token.di";
import { TodayMenuQueryPort } from "../../domain/ports/out/today-menu-query.port";
import { TodayMenuRelationEntity } from "../../domain/model/today-menu-with-relations.entity";
import { MenuRecommendationRelationEntity } from "../../../menu-recommendation/domain/model/menu-recommendation-with-relations.entity";
import { MenuRecommendationId } from "../../../menu-recommendation/domain/model/menu-recommendation-id.vo";
import { PickTodayMenuCommand } from "../../domain/ports/out/pick-today-menu.command";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TodayMenuPersistencePort } from "../../domain/ports/out/today-menu-persistence.port";
import { UpsertTodayMenuCommand } from "../../domain/ports/out/upsert-today-menu.command";
import { UpsertTodayMenuEntity } from "../../domain/model/upsert-today-menu.entity";
import { DateHelper } from "../../../../shared/date/date.helper";
import { YearMonthDayString } from "../../../daily-todo/domain/vo/year-month-day-string.vo";
import { OutboxPersistencePort } from "../../../outbox/domain/ports/out/outbox-persistence.port";
import { CreateOutboxEntity } from "../../../outbox/domain/model/create-outbox.entity";
import { EventType } from "../../../outbox/domain/model/event-type.enum";
import { OutboxStatus } from "../../../outbox/domain/model/outbox-status.enum";
import { OutboxPayloadFactoryRegistry } from "../../../outbox/domain/model/outbox-payload-factory.registry";
import { UserQueryPort } from "../../../user/domain/ports/out/user-query.port";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { MessageEnum } from "../../../outbox/domain/model/message.enum";

@Injectable()
export class PickTodayMenuService implements PickTodayMenuUseCase {
  constructor(
    @Inject(DIToken.TodayMenuModule.TodayMenuQueryPort)
    private readonly todayMenuQueryPort: TodayMenuQueryPort,
    @Inject(DIToken.TodayMenuModule.TodayMenuPersistencePort)
    private readonly todayMenuPersistencePort: TodayMenuPersistencePort,
    @Inject(DIToken.OutboxModule.OutboxPersistencePort)
    private readonly outboxPersistencePort: OutboxPersistencePort,
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    command: PickTodayMenuCommand,
  ): Promise<MenuRecommendationId> {
    const menu = await this.getBy(command.getId);
    this.checkCandidates(menu.getCandidates);

    const candidates = menu.getCandidates;
    const forPickRandomIndex = this.getRandomIndex(candidates.length);
    const pickedMenuId = this.pickCandidate(candidates, forPickRandomIndex);
    await this.upsertRecommendedMenu(
      UpsertTodayMenuCommand.of(
        candidates.map((item) => item.getId),
        pickedMenuId,
        YearMonthDayString.fromString(DateHelper.formatDate()),
        command.getId,
      ),
    );
    await this.saveOutboxBy(
      pickedMenuId.toString(),
      candidates[forPickRandomIndex].getName,
      candidates[forPickRandomIndex].getRegisterPerson.getId,
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

  private async createTodayMenuOutboxEntity(
    todayMenuId: string,
    pickedName: string,
    userId: UserId,
  ): Promise<CreateOutboxEntity> {
    const userInformation = await this.userQueryPort.findById(userId);
    const payload = OutboxPayloadFactoryRegistry.MESSAGE({
      id: todayMenuId,
      title: "오늘의 추천메뉴가 도착했어요.",
      body: `오늘의 추천 메뉴는 ${pickedName} !\n ${userInformation.getUsername}님께서 추천하신 메뉴에요.`,
      recipient: userInformation.getEmail,
      senderId: userInformation.getId.toString(),
      type: MessageEnum.MAIL_MESSAGE,
    });
    return CreateOutboxEntity.of(
      EventType.MESSAGE,
      payload,
      OutboxStatus.PENDING,
      1,
      1,
    );
  }

  private async saveOutboxBy(
    todayMenuId: string,
    pickedName: string,
    userId: UserId,
  ): Promise<void> {
    const payload = await this.createTodayMenuOutboxEntity(
      todayMenuId,
      pickedName,
      userId,
    );
    await this.outboxPersistencePort.save(payload);
  }
}
