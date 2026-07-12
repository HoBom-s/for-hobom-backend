import { Inject, Injectable } from "@nestjs/common";
import { GetLawVersionsUseCase } from "../../domain/ports/in/get-law-versions.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LawVersionQueryPort } from "../../domain/ports/out/law-version-query.port";
import { LawVersionEntitySchema } from "../../domain/model/law-version.entity";

@Injectable()
export class GetLawVersionsService implements GetLawVersionsUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LawVersionQueryPort)
    private readonly lawVersionQueryPort: LawVersionQueryPort,
  ) {}

  public async invoke(): Promise<LawVersionEntitySchema[]> {
    return this.lawVersionQueryPort.findAll();
  }
}
