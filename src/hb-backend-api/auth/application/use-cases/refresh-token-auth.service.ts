import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenExpiredError } from "jsonwebtoken";
import { RefreshAuthTokenUseCase } from "../ports/in/refresh-auth-token.use-case";
import { JwtAuthPort } from "../ports/out/jwt-auth.port";
import { AuthQueryPort } from "../ports/out/auth-query.port";
import { AuthPersistencePort } from "../ports/out/auth-persistence.port";
import { LoginAuthResult } from "../result/login-auth.result";

@Injectable()
export class RefreshTokenAuthService implements RefreshAuthTokenUseCase {
  constructor(
    @Inject("JwtAuthPort")
    private readonly jwtAuthPort: JwtAuthPort,
    @Inject("AuthQueryPort")
    private readonly authQueryPort: AuthQueryPort,
    @Inject("AuthPersistencePort")
    private readonly authPersistencePort: AuthPersistencePort,
  ) {}

  public async invoke(refreshToken: string): Promise<LoginAuthResult> {
    try {
      const payload = this.jwtAuthPort.verifyRefreshToken(refreshToken);

      const authUser =
        await this.authQueryPort.findByRefreshToken(refreshToken);
      if (authUser == null || authUser.getNickname !== payload.sub) {
        throw new UnauthorizedException("Token 이 일치하지 않아요.");
      }

      const newAccessToken = this.jwtAuthPort.signAccessToken({
        sub: payload.sub,
      });

      return LoginAuthResult.of(newAccessToken, refreshToken);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // 리프래시 토큰 만료
        const decoded = this.jwtAuthPort.decode(refreshToken);
        if (decoded?.sub == null) {
          throw new UnauthorizedException("Token 이 파싱되지 않아요.");
        }

        const newPayload = { sub: decoded.sub };
        const newAccessToken = this.jwtAuthPort.signAccessToken(newPayload);
        const newRefreshToken = this.jwtAuthPort.signRefreshToken(newPayload);

        await this.authPersistencePort.updateRefreshToken(
          decoded.sub,
          newRefreshToken,
        );

        return LoginAuthResult.of(newAccessToken, newRefreshToken);
      }

      throw new UnauthorizedException(`Token 이 유효하지 않아요. ${error}`);
    }
  }
}
