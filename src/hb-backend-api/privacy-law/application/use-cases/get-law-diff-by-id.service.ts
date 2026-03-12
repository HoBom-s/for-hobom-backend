import { Inject, Injectable } from "@nestjs/common";
import { GetLawDiffByIdUseCase } from "../../domain/ports/in/get-law-diff-by-id.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LawDiffQueryPort } from "../../domain/ports/out/law-diff-query.port";
import { LawDiffId } from "../../domain/model/law-diff-id.vo";
import { LawDiffEntitySchema } from "../../domain/model/law-diff.entity";

@Injectable()
export class GetLawDiffByIdService implements GetLawDiffByIdUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LawDiffQueryPort)
    private readonly lawDiffQueryPort: LawDiffQueryPort,
  ) {}

  public async invoke(id: LawDiffId): Promise<LawDiffEntitySchema> {
    return this.lawDiffQueryPort.findById(id);
  }
}
