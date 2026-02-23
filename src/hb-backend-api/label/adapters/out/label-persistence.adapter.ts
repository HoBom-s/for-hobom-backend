import { Inject, Injectable } from "@nestjs/common";
import { LabelPersistencePort } from "../../domain/ports/out/label-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";
import { LabelRepository } from "../../domain/model/label.repository";
import {
  LabelCreateEntitySchema,
  LabelUpdateEntitySchema,
} from "../../domain/model/label.entity";
import { LabelId } from "../../domain/model/label-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Injectable()
export class LabelPersistenceAdapter implements LabelPersistencePort {
  constructor(
    @Inject(DIToken.LabelModule.LabelRepository)
    private readonly labelRepository: LabelRepository,
  ) {}

  public async save(schema: LabelCreateEntitySchema): Promise<void> {
    await this.labelRepository.save(schema);
  }

  public async updateOne(
    id: LabelId,
    schema: LabelUpdateEntitySchema,
  ): Promise<void> {
    await this.labelRepository.updateTitle(id, schema);
  }

  public async deleteOne(id: LabelId, owner: UserId): Promise<void> {
    await this.labelRepository.deleteOne(id, owner);
  }
}
