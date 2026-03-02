import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Inject, Post, Res, UseGuards } from "@nestjs/common";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";
import { Response } from "express";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { LoginAuthUseCase } from "../../domain/ports/in/login-auth.use-case";
import { LoginAuthDto } from "./login-auth.dto";
import { LoginAuthCommand } from "../../domain/ports/out/login-auth.command";

@ApiTags("Auth")
@Controller(`${EndPointPrefixConstant}/auth`)
export class AuthLoginController {
  private readonly ACCESS_TOKEN = "accessToken";
  private readonly REFRESH_TOKEN = "refreshToken";
  private readonly ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000;
  private readonly REFRESH_TOKEN_EXPIRATION = 30 * 24 * 60 * 60 * 1000;

  constructor(
    @Inject(DIToken.AuthModule.LoginAuthUseCase)
    private readonly loginAuthUseCase: LoginAuthUseCase,
  ) {}

  @ApiOperation({
    summary: "사용자 로그인",
    description: "사용자 로그인 후 httpOnly 쿠키로 토큰 설정",
  })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post("/login")
  public async login(
    @Body() body: LoginAuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const loginAuthResult = await this.loginAuthUseCase.invoke(
      LoginAuthCommand.of(body.nickname, body.password),
    );

    response.cookie(this.ACCESS_TOKEN, loginAuthResult.getAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: this.ACCESS_TOKEN_EXPIRATION,
    });
    response.cookie(this.REFRESH_TOKEN, loginAuthResult.getRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: this.REFRESH_TOKEN_EXPIRATION,
    });
  }
}
