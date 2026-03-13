import { Inject, Injectable } from "@nestjs/common";
import { LawVersionQueryPort } from "../../domain/ports/out/law-version-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { LawVersionRepository } from "../../domain/repositories/law-version.repository";
import { LawVersionEntitySchema } from "../../domain/model/law-version.entity";
import { LawVersionId } from "../../domain/model/law-version-id.vo";
import { LawArticle } from "../../domain/model/law-article.vo";
import { LawVersionDocument } from "../../domain/model/law-version.schema";

@Injectable()
export class LawVersionQueryAdapter implements LawVersionQueryPort {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LawVersionRepository)
    private readonly lawVersionRepository: LawVersionRepository,
  ) {}

  public async findAll(): Promise<LawVersionEntitySchema[]> {
    const docs = await this.lawVersionRepository.findAll();
    if (docs.length === 0) {
      return [];
    }
    return docs.map((doc) => this.toEntity(doc));
  }

  public async findById(id: LawVersionId): Promise<LawVersionEntitySchema> {
    const doc = await this.lawVersionRepository.findById(id);
    return this.toEntity(doc);
  }

  public async findLatest(): Promise<LawVersionEntitySchema | null> {
    const doc = await this.lawVersionRepository.findLatest();
    if (!doc) {
      return null;
    }
    return this.toEntity(doc);
  }

  private toEntity(doc: LawVersionDocument): LawVersionEntitySchema {
    return LawVersionEntitySchema.of(
      LawVersionId.fromString(String(doc._id)),
      doc.lawId,
      doc.lawName,
      doc.proclamationDate,
      doc.enforcementDate,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (doc.articles ?? []).map((a) =>
        LawArticle.of(a.articleNo, a.title, a.content, a.paragraphs),
      ),
      doc.rawXml,
      doc.fetchedAt,
    );
  }
}
