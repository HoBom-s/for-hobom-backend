import { Inject, Injectable } from "@nestjs/common";
import { GetUserByNicknameUseCase } from "../../domain/ports/in/get-user-by-nickname.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { UserNickname } from "../../domain/model/user-nickname.vo";
import { UserQueryResult } from "../../domain/ports/out/user-query.result";
import { UserQueryPort } from "../../domain/ports/out/user-query.port";

@Injectable()
export class GetUserByNicknameService implements GetUserByNicknameUseCase {
  constructor(
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
  ) {}

  public async invoke(nickname: UserNickname): Promise<UserQueryResult> {
    const user = await this.userQueryPort.findByNickname(nickname);

    return UserQueryResult.from(user);
  }
}
