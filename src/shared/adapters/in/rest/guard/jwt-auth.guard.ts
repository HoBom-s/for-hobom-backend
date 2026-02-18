import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthPayloadModel } from "src/hb-backend-api/auth/domain/model/jwt-auth-payload.model";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  private readonly AUTHORIZE_KEY = "authorization";

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<JwtAuthPayloadModel>();
    const token = String(request.headers["authorization"]?.split(" ")[1]);

    if (token) {
      try {
        const decoded = this.jwtService.verify<JwtAuthPayloadModel>(token);
        request.nickname = decoded.sub;
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          const refreshToken = String(request.cookies["refreshToken"]);

          if (refreshToken) {
            const newAccessToken = await this.refreshAccessToken(refreshToken);

            if (newAccessToken) {
              request.headers[this.AUTHORIZE_KEY] = `Bearer ${newAccessToken}`;
              return super.canActivate(context) as Promise<boolean>;
            }
          }

          throw new UnauthorizedException(
            "토큰이 만료됐어요. 다시 로그인해 주세요.",
          );
        }

        throw new UnauthorizedException(
          `유효하지 않은 토큰이에요. ${err.message}`,
        );
      }
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  private async refreshAccessToken(
    refreshToken: string,
  ): Promise<string | null> {
    try {
      const decoded =
        await this.jwtService.verifyAsync<JwtAuthPayloadModel>(refreshToken);

      const newAccessToken = await this.jwtService.signAsync({
        nickname: decoded.sub,
      });

      return newAccessToken;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return null;
    }
  }
}
