import { Inject, Injectable } from "@nestjs/common";
import { RegisterJob } from "../../../../shared/adapters/in/job/job-metadata.decorator";
import { CronExpression } from "../../../../shared/constants/cron-expression.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { FetchLawVersionUseCase } from "../../domain/ports/in/fetch-law-version.use-case";

@Injectable()
@RegisterJob({
  name: "fetch-law-version-scheduler",
  cron: CronExpression.DAILY_6AM,
})
export class FetchLawVersionScheduler {
  constructor(
    @Inject(DIToken.PrivacyLawModule.FetchLawVersionUseCase)
    private readonly fetchLawVersionUseCase: FetchLawVersionUseCase,
  ) {}

  public async process() {
    await this.fetchLawVersionUseCase.invoke();
  }
}
