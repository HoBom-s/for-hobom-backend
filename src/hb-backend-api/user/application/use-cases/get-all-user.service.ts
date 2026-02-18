import { GetAllUserUseCase } from "../../domain/ports/in/get-all-user.use-case";
import { Inject } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { UserQueryPort } from "../../domain/ports/out/user-query.port";
import { UserQueryResult } from "../../domain/ports/out/user-query.result";

export class GetAllUserService implements GetAllUserUseCase {
  constructor(
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
  ) {}

  public async invoke(): Promise<UserQueryResult[]> {
    const foundUser = await this.userQueryPort.findAll();

    return foundUser.map((foundUser) => UserQueryResult.from(foundUser));
  }
}
