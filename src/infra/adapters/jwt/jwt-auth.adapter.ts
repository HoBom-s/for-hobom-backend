import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthPayloadModel } from "src/hb-backend-api/auth/domain/model/jwt-auth-payload.model";
import { JwtAuthPort } from "../../../hb-backend-api/auth/domain/ports/out/jwt-auth.port";
import { RefreshToken } from "../../../hb-backend-api/auth/domain/model/refresh-token.vo";

@Injectable()
export class JwtAuthAdapter implements JwtAuthPort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public signAccessToken(payload: JwtAuthPayloadModel): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow<string>(
        "HOBOM_JWT_ACCESS_TOKEN_EXPIRED",
      ),
    });
  }

  public signRefreshToken(payload: JwtAuthPayloadModel): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow<string>(
        "HOBOM_JWT_REFRESH_TOKEN_EXPIRED",
      ),
    });
  }

  public verifyAccessToken(token: RefreshToken): JwtAuthPayloadModel {
    return this.jwtService.verify(token.raw);
  }

  public verifyRefreshToken(token: RefreshToken): JwtAuthPayloadModel {
    return this.jwtService.verify(token.raw);
  }

  public decode(token: RefreshToken): JwtAuthPayloadModel | null {
    return this.jwtService.decode(token.raw);
  }
}
