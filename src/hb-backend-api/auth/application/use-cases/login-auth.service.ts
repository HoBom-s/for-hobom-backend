import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { compare } from "bcrypt";
import { LoginAuthUseCase } from "../ports/in/login-auth.use-case";
import { UserQueryPort } from "../../../user/application/ports/out/user-query.port";
import { LoginAuthResult } from "../result/login-auth.result";
import { LoginAuthCommand } from "../command/login-auth.command";
import { JwtAuthPort } from "../ports/out/jwt-auth.port";
import { UserEntitySchema } from "../../../user/domain/entity/user.entity";
import { AuthPersistencePort } from "../ports/out/auth-persistence.port";
import { AuthEntitySchema } from "../../domain/entity/auth.entity";
import { DIToken } from "../../../../shared/di/token.di";
import { UserNickname } from "../../../user/domain/vo/user-nickname.vo";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { AuthQueryPort } from "../ports/out/auth-query.port";

@Injectable()
export class LoginAuthService implements LoginAuthUseCase {
  constructor(
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
    @Inject(DIToken.AuthModule.AuthPersistencePort)
    private readonly authPersistencePort: AuthPersistencePort,
    @Inject(DIToken.AuthModule.AuthQueryPort)
    private readonly authQueryPort: AuthQueryPort,
    @Inject(DIToken.AuthModule.JwtAuthPort)
    private readonly jwtAuthPort: JwtAuthPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(command: LoginAuthCommand): Promise<LoginAuthResult> {
    const foundUser = await this.findUserByNickname(
      UserNickname.fromString(command.getNickname),
    );
    const isVerified = await this.comparePassword(
      command.getPassword,
      foundUser.getPassword,
    );

    if (!isVerified) {
      throw new BadRequestException("일치하는 사용자 정보가 없어요.");
    }

    const nickname = UserNickname.fromString(foundUser.getNickname);
    const existingAuth = await this.authQueryPort.findByNickname(nickname);
    const now = new Date();

    let refreshToken: string;

    const accessToken = this.generateAccessToken(nickname.raw);

    const isExistingTokenValid =
      existingAuth != null &&
      existingAuth.getExpiredAt.getTime() > now.getTime();

    if (isExistingTokenValid) {
      refreshToken = existingAuth.getRefreshToken;
    } else {
      refreshToken = this.generateRefreshToken(nickname.raw);
      const expiresAt = this.calculateRefreshTokenExpiry();

      await this.authPersistencePort.saveRefreshToken(
        AuthEntitySchema.of(nickname.raw, refreshToken, expiresAt),
      );
    }

    return LoginAuthResult.of(accessToken, refreshToken);
  }

  private async findUserByNickname(
    nickname: UserNickname,
  ): Promise<UserEntitySchema> {
    return await this.userQueryPort.findByNickname(nickname);
  }

  private async comparePassword(
    commandPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await compare(commandPassword, hashedPassword);
  }

  private generateAccessToken(nickname: string): string {
    return this.jwtAuthPort.signAccessToken({ sub: nickname });
  }

  private generateRefreshToken(nickname: string): string {
    return this.jwtAuthPort.signRefreshToken({ sub: nickname });
  }

  private async saveRefreshToken(nickname: string, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        Number(
          String(process.env.HOBOM_JWT_REFRESH_TOKEN_EXPIRED).replaceAll(
            "d",
            "",
          ),
        ),
    );

    await this.authPersistencePort.saveRefreshToken(
      AuthEntitySchema.of(nickname, refreshToken, expiresAt),
    );
  }

  private calculateRefreshTokenExpiry(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        Number(
          String(process.env.HOBOM_JWT_REFRESH_TOKEN_EXPIRED).replaceAll(
            "d",
            "",
          ),
        ),
    );
    return expiresAt;
  }
}
