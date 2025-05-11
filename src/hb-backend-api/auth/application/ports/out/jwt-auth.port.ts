import { JwtAuthPayloadModel } from "../../../domain/model/jwt-auth-payload.model";
import { RefreshToken } from "../../../domain/vo/refresh-token.vo";

export interface JwtAuthPort {
  signAccessToken(payload: JwtAuthPayloadModel): string;

  signRefreshToken(payload: JwtAuthPayloadModel): string;

  verifyAccessToken(token: RefreshToken): JwtAuthPayloadModel;

  verifyRefreshToken(token: RefreshToken): JwtAuthPayloadModel;

  decode(token: RefreshToken): JwtAuthPayloadModel | null;
}
