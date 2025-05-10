import { Inject, Injectable } from "@nestjs/common";
import { AuthEntitySchema } from "src/hb-backend-api/auth/domain/entity/auth.entity";
import { AuthPersistencePort } from "../../../application/ports/out/auth-persistence.port";
import { AuthRepository } from "../../../domain/repositories/auth.repository";

@Injectable()
export class AuthPersistenceAdapter implements AuthPersistencePort {
  constructor(
    @Inject("AuthRepository")
    private readonly authRepository: AuthRepository,
  ) {}

  public async saveRefreshToken(
    authEntitySchema: AuthEntitySchema,
  ): Promise<void> {
    await this.authRepository.save(authEntitySchema);
  }

  public async updateRefreshToken(
    nickname: string,
    newRefreshToken: string,
  ): Promise<void> {
    await this.authRepository.updateRefreshToken(nickname, newRefreshToken);
  }

  public async revokeToken(token: string): Promise<void> {
    await this.authRepository.revokeToken(token);
  }
}
