import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthPayloadModel } from "src/hb-backend-api/auth/domain/model/jwt-auth-payload.model";

export interface TokenUserInformation {
  nickname: string;
  accessToken: string;
}

export const NicknameAndAccessToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): TokenUserInformation | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const result = request.user as JwtAuthPayloadModel;

    return {
      nickname: result.sub,
      accessToken: String(request.cookies?.accessToken),
    };
  },
);
