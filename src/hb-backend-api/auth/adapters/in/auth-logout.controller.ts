import { Controller, Inject, Post, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { LogoutAuthUseCase } from "../../domain/ports/in/logout-auth.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { RefreshToken } from "../../domain/model/refresh-token.vo";

@ApiTags("Auth")
@Controller(`${EndPointPrefixConstant}/auth`)
export class AuthLogoutController {
  private ACCESS_TOKEN = "accessToken";
  private REFRESH_TOKEN = "refreshToken";

  constructor(
    @Inject(DIToken.AuthModule.LogoutAuthUseCase)
    private readonly logoutAuthUseCase: LogoutAuthUseCase,
  ) {}

  @ApiOperation({
    summary: "로그아웃",
    description: "리프레시 토큰 무효화 및 쿠키 클리어",
  })
  @Post("/logout")
  public async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshTokenValue = request.cookies?.[this.REFRESH_TOKEN];

    if (refreshTokenValue) {
      try {
        const refreshToken = RefreshToken.fromString(String(refreshTokenValue));
        await this.logoutAuthUseCase.invoke(refreshToken);
      } catch {
        // 토큰이 유효하지 않더라도 쿠키는 클리어
      }
    }

    response.clearCookie(this.ACCESS_TOKEN);
    response.clearCookie(this.REFRESH_TOKEN);
  }
}
