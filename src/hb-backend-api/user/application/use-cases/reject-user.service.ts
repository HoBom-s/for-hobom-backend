import { Inject, Injectable } from "@nestjs/common";
import { RejectUserUseCase } from "../../domain/ports/in/reject-user.use-case";
import { UserQueryPort } from "../../domain/ports/out/user-query.port";
import { UserId } from "../../domain/model/user-id.vo";
import { ApprovalStatus } from "../../domain/enums/approval-status.enum";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class RejectUserService implements RejectUserUseCase {
  constructor(
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
  ) {}

  public async invoke(id: UserId): Promise<void> {
    await this.userQueryPort.findById(id);
    await this.userQueryPort.updateApprovalStatus(id, ApprovalStatus.REJECTED);
  }
}
