import { Inject, Injectable } from "@nestjs/common";
import { RegisterJob } from "../../../../shared/adapters/in/job/job-metadata.decorator";
import { CronExpression } from "../../../../shared/constants/cron-expression.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { ProcessNoteDestroyUseCase } from "../../domain/ports/in/process-note-destroy.use-case";

@Injectable()
@RegisterJob({
  name: "process-note-destroy-scheduler",
  cron: CronExpression.DAILY_8AM_30M,
})
export class ProcessNoteDestroyScheduler {
  constructor(
    @Inject(DIToken.NoteModule.ProcessNoteDestroyUseCase)
    private readonly processNoteDestroyUseCase: ProcessNoteDestroyUseCase,
  ) {}

  public async process() {
    await this.processNoteDestroyUseCase.invoke();
  }
}
