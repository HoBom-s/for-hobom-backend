import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { LoginAuthUseCase } from "../../domain/ports/in/login-auth.use-case";
import { GetLoginTokenDto } from "./get-login-token.dto";
import { LoginAuthDto } from "./login-auth.dto";
import { LoginAuthCommand } from "../../domain/ports/out/login-auth.command";

@ApiTags("Auth")
@Controller(`${EndPointPrefixConstant}/auth`)
export class AuthLoginController {
  constructor(
    @Inject(DIToken.AuthModule.LoginAuthUseCase)
    private readonly loginAuthUseCase: LoginAuthUseCase,
  ) {}

  @ApiOperation({
    summary: "사용자 로그인",
    description: "사용자 로그인",
  })
  @ApiResponse({ type: GetLoginTokenDto })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post("/login")
  public async login(@Body() body: LoginAuthDto): Promise<GetLoginTokenDto> {
    const loginAuthResult = await this.loginAuthUseCase.invoke(
      LoginAuthCommand.of(body.nickname, body.password),
    );

    return GetLoginTokenDto.from(loginAuthResult);
  }
}
