import { Inject, Injectable } from "@nestjs/common";
import { LawDiffPersistencePort } from "../../domain/ports/out/law-diff-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";
import { LawDiffRepository } from "../../domain/repositories/law-diff.repository";
import { ChangeType } from "../../domain/enums/change-type.enum";

@Injectable()
export class LawDiffPersistenceAdapter implements LawDiffPersistencePort {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LawDiffRepository)
    private readonly lawDiffRepository: LawDiffRepository,
  ) {}

  public async save(data: {
    fromVersionId: string;
    toVersionId: string;
    fromProclamationDate: string;
    toProclamationDate: string;
    changes: {
      articleNo: string;
      changeType: ChangeType;
      before: string | null;
      after: string | null;
    }[];
  }): Promise<void> {
    await this.lawDiffRepository.save(data);
  }
}
