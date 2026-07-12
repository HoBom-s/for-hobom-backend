import { Inject, Injectable } from "@nestjs/common";
import { LogoutAuthUseCase } from "../../domain/ports/in/logout-auth.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { AuthPersistencePort } from "../../domain/ports/out/auth-persistence.port";
import { RefreshToken } from "../../domain/model/refresh-token.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class LogoutAuthService implements LogoutAuthUseCase {
  constructor(
    @Inject(DIToken.AuthModule.AuthPersistencePort)
    private readonly authPersistencePort: AuthPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(refreshToken: RefreshToken): Promise<void> {
    await this.authPersistencePort.revokeToken(refreshToken);
  }
}
