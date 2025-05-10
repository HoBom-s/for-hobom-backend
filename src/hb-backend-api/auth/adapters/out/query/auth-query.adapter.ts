import { Inject, Injectable } from "@nestjs/common";
import { AuthQueryPort } from "../../../application/ports/out/auth-query.port";
import { AuthEntitySchema } from "../../../domain/entity/auth.entity";
import { AuthRepository } from "../../../domain/repositories/auth.repository";

@Injectable()
export class AuthQueryAdapter implements AuthQueryPort {
  constructor(
    @Inject("AuthRepository")
    private readonly authRepository: AuthRepository,
  ) {}

  public async findByRefreshToken(token: string): Promise<AuthEntitySchema> {
    const foundAuth = await this.authRepository.findByRefreshToken(token);
    const { nickname, refreshToken, expiresAt } = foundAuth;

    return new AuthEntitySchema(nickname, refreshToken, expiresAt);
  }
}
