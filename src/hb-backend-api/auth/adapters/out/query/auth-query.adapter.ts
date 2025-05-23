import { Inject, Injectable } from "@nestjs/common";
import { AuthQueryPort } from "../../../application/ports/out/auth-query.port";
import { AuthEntitySchema } from "../../../domain/entity/auth.entity";
import { AuthRepository } from "../../../domain/repositories/auth.repository";
import { DIToken } from "../../../../../shared/di/token.di";
import { RefreshToken } from "../../../domain/vo/refresh-token.vo";
import { UserNickname } from "src/hb-backend-api/user/domain/vo/user-nickname.vo";

@Injectable()
export class AuthQueryAdapter implements AuthQueryPort {
  constructor(
    @Inject(DIToken.AuthModule.AuthRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  public async findByRefreshToken(
    token: RefreshToken,
  ): Promise<AuthEntitySchema> {
    const foundAuth = await this.authRepository.findByRefreshToken(token);
    const { nickname, refreshToken, expiresAt } = foundAuth;

    return new AuthEntitySchema(nickname, refreshToken, expiresAt);
  }

  public async findByNickname(
    nickname: UserNickname,
  ): Promise<AuthEntitySchema | null> {
    const foundAuth = await this.authRepository.findByNickname(nickname);
    if (foundAuth == null) {
      return null;
    }

    return AuthEntitySchema.of(
      foundAuth.nickname,
      foundAuth.refreshToken,
      foundAuth.expiresAt,
    );
  }
}
