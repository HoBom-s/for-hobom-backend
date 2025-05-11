import { Inject, Injectable } from "@nestjs/common";
import { AuthEntitySchema } from "src/hb-backend-api/auth/domain/entity/auth.entity";
import { AuthPersistencePort } from "../../../application/ports/out/auth-persistence.port";
import { AuthRepository } from "../../../domain/repositories/auth.repository";
import { DIToken } from "../../../../../shared/di/token.di";
import { RefreshToken } from "../../../domain/vo/refresh-token.vo";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";

@Injectable()
export class AuthPersistenceAdapter implements AuthPersistencePort {
  constructor(
    @Inject(DIToken.AuthModule.AuthRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  public async saveRefreshToken(
    authEntitySchema: AuthEntitySchema,
  ): Promise<void> {
    await this.authRepository.save(authEntitySchema);
  }

  public async updateRefreshToken(
    nickname: UserNickname,
    newRefreshToken: RefreshToken,
  ): Promise<void> {
    await this.authRepository.updateRefreshToken(nickname, newRefreshToken);
  }

  public async revokeToken(token: RefreshToken): Promise<void> {
    await this.authRepository.revokeToken(token);
  }
}
