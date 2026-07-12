import { Inject, Injectable } from "@nestjs/common";
import { GetLawDiffsUseCase } from "../../domain/ports/in/get-law-diffs.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LawDiffQueryPort } from "../../domain/ports/out/law-diff-query.port";
import { LawDiffEntitySchema } from "../../domain/model/law-diff.entity";

@Injectable()
export class GetLawDiffsService implements GetLawDiffsUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LawDiffQueryPort)
    private readonly lawDiffQueryPort: LawDiffQueryPort,
  ) {}

  public async invoke(): Promise<LawDiffEntitySchema[]> {
    return this.lawDiffQueryPort.findAll();
  }
}
