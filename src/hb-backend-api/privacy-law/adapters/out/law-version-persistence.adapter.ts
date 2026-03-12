import { Inject, Injectable } from "@nestjs/common";
import { LawVersionPersistencePort } from "../../domain/ports/out/law-version-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";
import { LawVersionRepository } from "../../domain/repositories/law-version.repository";

@Injectable()
export class LawVersionPersistenceAdapter implements LawVersionPersistencePort {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LawVersionRepository)
    private readonly lawVersionRepository: LawVersionRepository,
  ) {}

  public async save(data: {
    lawId: string;
    lawName: string;
    proclamationDate: string;
    enforcementDate: string;
    articles: {
      articleNo: string;
      title: string;
      content: string;
      paragraphs: {
        no: string;
        content: string;
        subItems: { no: string; content: string }[];
      }[];
    }[];
    rawXml: string;
    fetchedAt: Date;
  }): Promise<void> {
    await this.lawVersionRepository.save(data);
  }
}
