import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller,
  Inject,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { LoginAuthUseCase } from "../../../application/ports/in/login-auth.use-case";
import { GetLoginTokenDto } from "../dto/get-login-token.dto";
import { CookiesInterceptor } from "../../../../../shared/adpaters/in/rest/interceptors/cookie.interceptor";
import { LoginAuthDto } from "../dto/login-auth.dto";
import { LoginAuthCommand } from "../../../application/command/login-auth.command";

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
  @Post("/login")
  @UseInterceptors(CookiesInterceptor)
  public async login(@Body() body: LoginAuthDto): Promise<GetLoginTokenDto> {
    const loginAuthResult = await this.loginAuthUseCase.invoke(
      LoginAuthCommand.of(body.nickname, body.password),
    );

    return GetLoginTokenDto.from(loginAuthResult);
  }
}
