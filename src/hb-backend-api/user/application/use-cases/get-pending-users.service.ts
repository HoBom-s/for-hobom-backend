import { Inject, Injectable } from "@nestjs/common";
import { GetPendingUsersUseCase } from "../../domain/ports/in/get-pending-users.use-case";
import { UserQueryPort } from "../../domain/ports/out/user-query.port";
import { UserEntitySchema } from "../../domain/model/user.entity";
import { DIToken } from "../../../../shared/di/token.di";

@Injectable()
export class GetPendingUsersService implements GetPendingUsersUseCase {
  constructor(
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
  ) {}

  public async invoke(): Promise<UserEntitySchema[]> {
    return this.userQueryPort.findPendingUsers();
  }
}
