import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthPayloadModel } from "src/hb-backend-api/auth/domain/model/jwt-auth-payload.model";
import { JwtAuthPort } from "../../../hb-backend-api/auth/application/ports/out/jwt-auth.port";

@Injectable()
export class JwtAuthAdapter implements JwtAuthPort {
  constructor(private readonly jwtService: JwtService) {}

  public signAccessToken(payload: JwtAuthPayloadModel): string {
    return this.jwtService.sign(payload, {
      expiresIn: process.env.HOBOM_JWT_ACCESS_TOKEN_EXPIRED,
    });
  }

  public signRefreshToken(payload: JwtAuthPayloadModel): string {
    return this.jwtService.sign(payload, {
      expiresIn: process.env.HOBOM_JWT_REFRESH_TOKEN_EXPIRED,
    });
  }

  public verifyAccessToken(token: string): JwtAuthPayloadModel {
    return this.jwtService.verify(token);
  }

  public verifyRefreshToken(token: string): JwtAuthPayloadModel {
    return this.jwtService.verify(token);
  }

  public decode(token: string): JwtAuthPayloadModel | null {
    return this.jwtService.decode(token);
  }
}
