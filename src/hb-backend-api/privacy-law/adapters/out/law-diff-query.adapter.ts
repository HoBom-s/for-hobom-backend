import { Inject, Injectable } from "@nestjs/common";
import { LawDiffQueryPort } from "../../domain/ports/out/law-diff-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { LawDiffRepository } from "../../domain/repositories/law-diff.repository";
import { LawDiffEntitySchema } from "../../domain/model/law-diff.entity";
import { LawDiffId } from "../../domain/model/law-diff-id.vo";
import { LawVersionId } from "../../domain/model/law-version-id.vo";
import { ArticleChange } from "../../domain/model/article-change.vo";
import { LawDiffDocument } from "../../domain/model/law-diff.schema";

@Injectable()
export class LawDiffQueryAdapter implements LawDiffQueryPort {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LawDiffRepository)
    private readonly lawDiffRepository: LawDiffRepository,
  ) {}

  public async findAll(): Promise<LawDiffEntitySchema[]> {
    const docs = await this.lawDiffRepository.findAll();
    if (docs.length === 0) return [];
    return docs.map((doc) => this.toEntity(doc));
  }

  public async findById(id: LawDiffId): Promise<LawDiffEntitySchema> {
    const doc = await this.lawDiffRepository.findById(id);
    return this.toEntity(doc);
  }

  public async findByVersionId(
    versionId: LawVersionId,
  ): Promise<LawDiffEntitySchema[]> {
    const docs = await this.lawDiffRepository.findByVersionId(versionId);
    if (docs.length === 0) return [];
    return docs.map((doc) => this.toEntity(doc));
  }

  private toEntity(doc: LawDiffDocument): LawDiffEntitySchema {
    return LawDiffEntitySchema.of(
      LawDiffId.fromString(String(doc._id)),
      LawVersionId.fromString(String(doc.fromVersionId)),
      LawVersionId.fromString(String(doc.toVersionId)),
      doc.fromProclamationDate,
      doc.toProclamationDate,
      (doc.changes ?? []).map((c) =>
        ArticleChange.of(c.articleNo, c.changeType, c.before, c.after),
      ),
    );
  }
}
