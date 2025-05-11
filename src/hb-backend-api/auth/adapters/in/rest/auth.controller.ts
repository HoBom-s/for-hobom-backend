import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  Res,
  UseInterceptors,
} from "@nestjs/common";
import { Request, Response } from "express";
import { LoginAuthUseCase } from "../../../application/ports/in/login-auth.use-case";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { LoginAuthDto } from "../dto/login-auth.dto";
import { ResponseEntity } from "../../../../../shared/response/response.entity";
import { GetLoginTokenDto } from "../dto/get-login-token.dto";
import { LoginAuthCommand } from "../../../application/command/login-auth.command";
import { RefreshAuthTokenUseCase } from "../../../application/ports/in/refresh-auth-token.use-case";
import { CookiesInterceptor } from "../../../../../shared/adpaters/in/rest/interceptors/cookie.interceptor";
import { DIToken } from "../../../../../shared/di/token.di";
import { RefreshToken } from "../../../domain/vo/refresh-token.vo";

@Controller(`${EndPointPrefixConstant}/auth`)
export class AuthController {
  private ACCESS_TOKEN = "accessToken";
  private REFRESH_TOKEN = "refreshToken";
  private ACCESS_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000;
  private REFRESH_TOKEN_EXPIRATION = 30 * 24 * 60 * 60 * 1000;

  constructor(
    @Inject(DIToken.AuthModule.LoginAuthUseCase)
    private readonly loginAuthUseCase: LoginAuthUseCase,
    @Inject(DIToken.AuthModule.RefreshAuthTokenUseCase)
    private readonly refreshTokenUseCase: RefreshAuthTokenUseCase,
  ) {}

  @Post("/login")
  @UseInterceptors(CookiesInterceptor)
  public async login(
    @Body() body: LoginAuthDto,
  ): Promise<ResponseEntity<GetLoginTokenDto>> {
    const loginAuthResult = await this.loginAuthUseCase.invoke(
      LoginAuthCommand.of(body.nickname, body.password),
    );

    return ResponseEntity.ok<GetLoginTokenDto>(
      GetLoginTokenDto.from(loginAuthResult),
    );
  }

  @Post("/refresh")
  public async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseEntity<void>> {
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

    return ResponseEntity.ok<void>(undefined);
  }
}
