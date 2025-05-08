import { JwtAuthPayloadModel } from "../../../domain/model/jwt-auth-payload.model";

export interface JwtAuthPort {
  signAccessToken(payload: JwtAuthPayloadModel): string;

  signRefreshToken(payload: JwtAuthPayloadModel): string;

  verifyAccessToken(token: string): JwtAuthPayloadModel;

  verifyRefreshToken(token: string): JwtAuthPayloadModel;

  decode(token: string): JwtAuthPayloadModel | null;
}
