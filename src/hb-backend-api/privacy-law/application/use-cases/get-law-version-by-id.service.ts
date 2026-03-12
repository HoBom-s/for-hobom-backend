import { Inject, Injectable } from "@nestjs/common";
import { GetLawVersionByIdUseCase } from "../../domain/ports/in/get-law-version-by-id.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LawVersionQueryPort } from "../../domain/ports/out/law-version-query.port";
import { LawVersionId } from "../../domain/model/law-version-id.vo";
import { LawVersionEntitySchema } from "../../domain/model/law-version.entity";

@Injectable()
export class GetLawVersionByIdService implements GetLawVersionByIdUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LawVersionQueryPort)
    private readonly lawVersionQueryPort: LawVersionQueryPort,
  ) {}

  public async invoke(id: LawVersionId): Promise<LawVersionEntitySchema> {
    return this.lawVersionQueryPort.findById(id);
  }
}
