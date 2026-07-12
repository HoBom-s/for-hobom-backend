import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenExpiredError } from "jsonwebtoken";
import { RefreshAuthTokenUseCase } from "../../domain/ports/in/refresh-auth-token.use-case";
import { JwtAuthPort } from "../../domain/ports/out/jwt-auth.port";
import { AuthQueryPort } from "../../domain/ports/out/auth-query.port";
import { AuthPersistencePort } from "../../domain/ports/out/auth-persistence.port";
import { LoginAuthResult } from "../../domain/ports/out/login-auth.result";
import { DIToken } from "../../../../shared/di/token.di";
import { RefreshToken } from "../../domain/model/refresh-token.vo";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class RefreshTokenAuthService implements RefreshAuthTokenUseCase {
  constructor(
    @Inject(DIToken.AuthModule.JwtAuthPort)
    private readonly jwtAuthPort: JwtAuthPort,
    @Inject(DIToken.AuthModule.AuthQueryPort)
    private readonly authQueryPort: AuthQueryPort,
    @Inject(DIToken.AuthModule.AuthPersistencePort)
    private readonly authPersistencePort: AuthPersistencePort,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(refreshToken: RefreshToken): Promise<LoginAuthResult> {
    try {
      const payload = this.jwtAuthPort.verifyRefreshToken(refreshToken);

      const authUser =
        await this.authQueryPort.findByRefreshToken(refreshToken);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (authUser?.getNickname !== payload.sub) {
        throw new UnauthorizedException("Token 이 일치하지 않아요.");
      }

      const newAccessToken = this.jwtAuthPort.signAccessToken({
        sub: payload.sub,
      });

      return LoginAuthResult.of(newAccessToken, refreshToken.raw);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // 서명은 유효하지만 만료된 경우만 허용 (서명 검증 필수)
        const decoded =
          this.jwtAuthPort.verifyRefreshTokenIgnoreExpiry(refreshToken);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (decoded.sub == null) {
          throw new UnauthorizedException("Token 이 파싱되지 않아요.");
        }

        // DB에서 토큰 존재 여부 확인
        const authUser =
          await this.authQueryPort.findByRefreshToken(refreshToken);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (authUser?.getNickname !== decoded.sub) {
          throw new UnauthorizedException("Token 이 일치하지 않아요.");
        }

        const newPayload = { sub: decoded.sub };
        const newAccessToken = this.jwtAuthPort.signAccessToken(newPayload);
        const newRefreshToken = this.jwtAuthPort.signRefreshToken(newPayload);

        await this.authPersistencePort.updateRefreshToken(
          UserNickname.fromString(decoded.sub),
          RefreshToken.fromString(newRefreshToken),
        );

        return LoginAuthResult.of(newAccessToken, newRefreshToken);
      }

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("Token 이 유효하지 않아요.");
    }
  }
}
