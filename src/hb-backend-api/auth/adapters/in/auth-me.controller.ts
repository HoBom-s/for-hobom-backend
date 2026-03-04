import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { GetUserDto } from "../../../user/adapters/in/get-user.dto";

@ApiTags("Auth")
@Controller(`${EndPointPrefixConstant}/auth`)
export class AuthMeController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
  ) {}

  @ApiOperation({ summary: "현재 로그인한 사용자 정보 조회" })
  @ApiResponse({ type: GetUserDto })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  public async me(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<GetUserDto> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    return GetUserDto.from(user);
  }
}
