import { Inject, Injectable } from "@nestjs/common";
import { GetUserUseCase } from "../../domain/ports/in/get-user.use-case";
import { UserQueryPort } from "../../domain/ports/out/user-query.port";
import { UserQueryResult } from "../../domain/ports/out/user-query.result";
import { DIToken } from "../../../../shared/di/token.di";
import { UserId } from "../../domain/model/user-id.vo";

@Injectable()
export class GetUserService implements GetUserUseCase {
  constructor(
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
  ) {}

  public async invoke(id: UserId): Promise<UserQueryResult> {
    const foundUser = await this.userQueryPort.findById(id);

    return UserQueryResult.from(foundUser);
  }
}
