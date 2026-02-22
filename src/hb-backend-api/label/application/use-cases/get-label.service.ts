import { Inject, Injectable } from "@nestjs/common";
import { GetLabelUseCase } from "../../domain/ports/in/get-label.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LabelQueryPort } from "../../domain/ports/out/label-query.port";
import { LabelId } from "../../domain/model/label-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { LabelQueryResult } from "../../domain/ports/out/label-query.result";

@Injectable()
export class GetLabelService implements GetLabelUseCase {
  constructor(
    @Inject(DIToken.LabelModule.LabelQueryPort)
    private readonly labelQueryPort: LabelQueryPort,
  ) {}

  public async invoke(id: LabelId, owner: UserId): Promise<LabelQueryResult> {
    const label = await this.labelQueryPort.findById(id, owner);
    return LabelQueryResult.from(label);
  }
}
