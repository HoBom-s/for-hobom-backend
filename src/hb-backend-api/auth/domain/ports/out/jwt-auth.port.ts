import { JwtAuthPayloadModel } from "../../model/jwt-auth-payload.model";
import { RefreshToken } from "../../model/refresh-token.vo";

export interface JwtAuthPort {
  signAccessToken(payload: JwtAuthPayloadModel): string;

  signRefreshToken(payload: JwtAuthPayloadModel): string;

  verifyAccessToken(token: RefreshToken): JwtAuthPayloadModel;

  verifyRefreshToken(token: RefreshToken): JwtAuthPayloadModel;

  verifyRefreshTokenIgnoreExpiry(token: RefreshToken): JwtAuthPayloadModel;
}
