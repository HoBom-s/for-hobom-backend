import { Inject, Injectable } from "@nestjs/common";
import { RegisterJob } from "../../../../shared/adapters/in/job/job-metadata.decorator";
import { CronExpression } from "../../../../shared/constants/cron-expression.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { ProcessNoteRemindUseCase } from "../../domain/ports/in/process-note-remind.use-case";

@Injectable()
@RegisterJob({
  name: "process-note-remind-scheduler",
  cron: CronExpression.DAILY_9AM,
})
export class ProcessNoteRemindScheduler {
  constructor(
    @Inject(DIToken.NoteModule.ProcessNoteRemindUseCase)
    private readonly processNoteRemindUseCase: ProcessNoteRemindUseCase,
  ) {}

  public async process() {
    await this.processNoteRemindUseCase.invoke();
  }
}
