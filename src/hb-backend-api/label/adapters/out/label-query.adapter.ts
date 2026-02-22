import { Inject, Injectable } from "@nestjs/common";
import { LabelQueryPort } from "../../domain/ports/out/label-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { LabelRepository } from "../../domain/model/label.repository";
import { LabelEntitySchema } from "../../domain/model/label.entity";
import { LabelId } from "../../domain/model/label-id.vo";
import { LabelTitle } from "../../domain/model/label-title.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { LabelDocument } from "../../domain/model/label.schema";

@Injectable()
export class LabelQueryAdapter implements LabelQueryPort {
  constructor(
    @Inject(DIToken.LabelModule.LabelRepository)
    private readonly labelRepository: LabelRepository,
  ) {}

  public async findById(
    id: LabelId,
    owner: UserId,
  ): Promise<LabelEntitySchema> {
    const doc = await this.labelRepository.findById(id, owner);
    return this.toEntity(doc);
  }

  public async findAll(owner: UserId): Promise<LabelEntitySchema[]> {
    const docs = await this.labelRepository.findAll(owner);
    if (docs.length === 0) return [];
    return docs.map((doc) => this.toEntity(doc));
  }

  public async findByTitle(
    title: LabelTitle,
    owner: UserId,
  ): Promise<LabelEntitySchema | null> {
    const doc = await this.labelRepository.findByTitle(title, owner);
    if (doc == null) return null;
    return this.toEntity(doc);
  }

  private toEntity(doc: LabelDocument): LabelEntitySchema {
    return LabelEntitySchema.of(
      LabelId.fromString(String(doc._id)),
      LabelTitle.fromString(doc.title),
      UserId.fromString(String(doc.owner)),
    );
  }
}
