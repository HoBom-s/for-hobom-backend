import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtAuthPayloadModel } from "src/hb-backend-api/auth/domain/model/jwt-auth-payload.model"; // JwtPayloadModel에 맞게 수정

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: String(process.env.HOBOM_JWT_SECRET),
    });
  }

  validate(payload: JwtAuthPayloadModel) {
    return { sub: payload.sub, nickname: payload.nickname };
  }
}
