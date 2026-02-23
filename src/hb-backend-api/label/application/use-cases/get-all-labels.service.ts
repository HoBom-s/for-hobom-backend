import { Inject, Injectable } from "@nestjs/common";
import { GetAllLabelsUseCase } from "../../domain/ports/in/get-all-labels.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LabelQueryPort } from "../../domain/ports/out/label-query.port";
import { LabelQueryResult } from "../../domain/ports/out/label-query.result";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Injectable()
export class GetAllLabelsService implements GetAllLabelsUseCase {
  constructor(
    @Inject(DIToken.LabelModule.LabelQueryPort)
    private readonly labelQueryPort: LabelQueryPort,
  ) {}

  public async invoke(owner: UserId): Promise<LabelQueryResult[]> {
    const labels = await this.labelQueryPort.findAll(owner);
    if (labels.length === 0) return [];
    return labels.map(LabelQueryResult.from);
  }
}
