import { Inject, Injectable, Logger } from "@nestjs/common";
import { ProcessDailyTodoRecurrenceUseCase } from "../../domain/ports/in/process-daily-todo-recurrence.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoPersistencePort } from "../ports/out/daily-todo-persistence.port";
import { DailyTodoCreateEntitySchema } from "../../domain/entity/daily-todo.entity";
import { DailyTodoCompleteStatus } from "../../domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../domain/enums/daily-todo-cycle.enum";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { DateHelper } from "../../../../shared/date/date.helper";

@Injectable()
export class ProcessDailyTodoRecurrenceService implements ProcessDailyTodoRecurrenceUseCase {
  private static readonly KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  private readonly logger = new Logger(ProcessDailyTodoRecurrenceService.name);

  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoPersistencePort)
    private readonly dailyTodoPersistencePort: DailyTodoPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(): Promise<void> {
    const kstNow = new Date(
      Date.now() + ProcessDailyTodoRecurrenceService.KST_OFFSET_MS,
    );
    const todayKstStr = this.toDateString(kstNow);
    const yesterdayKst = new Date(kstNow.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayKstStr = this.toDateString(yesterdayKst);

    const applicableCycles = this.getApplicableCycles(kstNow.getUTCDay());

    const yesterdayDate = DateHelper.parse(yesterdayKstStr, "KST");
    const startOfYesterday = DateHelper.startOfDay(yesterdayDate);
    const endOfYesterday = DateHelper.endOfDay(yesterdayDate);

    const todos = await this.dailyTodoPersistencePort.findByDateRangeAndCycles(
      startOfYesterday,
      endOfYesterday,
      applicableCycles,
    );

    if (todos.length === 0) {
      this.logger.log("No recurring daily todos found");
      return;
    }

    const todayDate = DateHelper.parse(todayKstStr, "KST");

    const entities = todos.map((todo) =>
      DailyTodoCreateEntitySchema.of(
        todo.title,
        todayDate,
        todo.owner,
        null,
        DailyTodoCompleteStatus.PROGRESS,
        todo.cycle,
        todo.category,
      ),
    );

    await this.dailyTodoPersistencePort.saveAll(entities);
    this.logger.log(
      `Created ${entities.length} recurring daily todos for ${todayKstStr}`,
    );
  }

  private getApplicableCycles(dayOfWeek: number): DailyTodoCycle[] {
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return isWeekend
      ? [DailyTodoCycle.EVERYDAY, DailyTodoCycle.EVERY_WEEKEND]
      : [DailyTodoCycle.EVERYDAY, DailyTodoCycle.EVERY_WEEKDAY];
  }

  private toDateString(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
}
