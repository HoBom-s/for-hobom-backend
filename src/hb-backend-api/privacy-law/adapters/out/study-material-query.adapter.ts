import { Inject, Injectable } from "@nestjs/common";
import { StudyMaterialQueryPort } from "../../domain/ports/out/study-material-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { StudyMaterialRepository } from "../../domain/repositories/study-material.repository";
import { StudyMaterialEntitySchema } from "../../domain/model/study-material.entity";
import { StudyMaterialId } from "../../domain/model/study-material-id.vo";
import { LawDiffId } from "../../domain/model/law-diff-id.vo";
import { StudyMaterialDocument } from "../../domain/model/study-material.schema";

@Injectable()
export class StudyMaterialQueryAdapter implements StudyMaterialQueryPort {
  constructor(
    @Inject(DIToken.PrivacyLawModule.StudyMaterialRepository)
    private readonly studyMaterialRepository: StudyMaterialRepository,
  ) {}

  public async findAll(): Promise<StudyMaterialEntitySchema[]> {
    const docs = await this.studyMaterialRepository.findAll();
    if (docs.length === 0) return [];
    return docs.map((doc) => this.toEntity(doc));
  }

  public async findById(
    id: StudyMaterialId,
  ): Promise<StudyMaterialEntitySchema> {
    const doc = await this.studyMaterialRepository.findById(id);
    return this.toEntity(doc);
  }

  public async findByDiffId(
    diffId: LawDiffId,
  ): Promise<StudyMaterialEntitySchema | null> {
    const doc = await this.studyMaterialRepository.findByDiffId(diffId);
    if (!doc) return null;
    return this.toEntity(doc);
  }

  private toEntity(doc: StudyMaterialDocument): StudyMaterialEntitySchema {
    return StudyMaterialEntitySchema.of(
      StudyMaterialId.fromString(String(doc._id)),
      LawDiffId.fromString(String(doc.diffId)),
      doc.summary,
      doc.keyPoints,
      doc.quizzes,
    );
  }
}
