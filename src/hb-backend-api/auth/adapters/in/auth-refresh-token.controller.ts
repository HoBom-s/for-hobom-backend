import { Controller, Inject, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { RefreshAuthTokenUseCase } from "../../domain/ports/in/refresh-auth-token.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { RefreshToken } from "../../domain/model/refresh-token.vo";

@ApiTags("Auth")
@Controller(`${EndPointPrefixConstant}/auth`)
export class AuthRefreshTokenController {
  private readonly ACCESS_TOKEN = "accessToken";
  private readonly REFRESH_TOKEN = "refreshToken";
  private readonly ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000;
  private readonly REFRESH_TOKEN_EXPIRATION = 30 * 24 * 60 * 60 * 1000;

  constructor(
    @Inject(DIToken.AuthModule.RefreshAuthTokenUseCase)
    private readonly refreshTokenUseCase: RefreshAuthTokenUseCase,
  ) {}

  @ApiOperation({
    summary: "리프래시 토큰 갱신",
    description: "리프래시 토큰 갱신",
  })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post("/refresh")
  public async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = String(request.cookies[this.REFRESH_TOKEN]);
    const loginAuthUser = await this.refreshTokenUseCase.invoke(
      RefreshToken.fromString(refreshToken),
    );

    response.cookie(this.ACCESS_TOKEN, loginAuthUser.getAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: this.ACCESS_TOKEN_EXPIRATION,
    });
    response.cookie(this.REFRESH_TOKEN, loginAuthUser.getRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: this.REFRESH_TOKEN_EXPIRATION,
    });
  }
}
