import { Injectable, ExecutionContext } from "@nestjs/common";
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
      } catch (e) {
        const refreshToken = String(request.cookies["refreshToken"]);

        if (refreshToken) {
          const newAccessToken = await this.refreshAccessToken(refreshToken);

          if (newAccessToken) {
            request.headers[this.AUTHORIZE_KEY] = `Bearer ${newAccessToken}`;
            return true;
          }
        }
        throw new Error(`토큰을 갱신하지 못했어요. ${e.name} : ${e.message}`);
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
