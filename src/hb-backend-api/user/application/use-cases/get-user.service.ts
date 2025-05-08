import { Inject, Injectable } from "@nestjs/common";
import { GetUserUseCase } from "../ports/in/get-user.use-case";
import { UserQueryPort } from "../ports/out/user-query.port";
import { UserQueryResult } from "../result/user-query.result";

@Injectable()
export class GetUserService implements GetUserUseCase {
  constructor(
    @Inject("UserQueryPort")
    private readonly userQueryPort: UserQueryPort,
  ) {}

  public async invoke(id: string): Promise<UserQueryResult> {
    const foundUser = await this.userQueryPort.findById(id);

    return UserQueryResult.from(foundUser);
  }
}
