import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const AccessToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request.cookies?.accessToken;
  },
);
