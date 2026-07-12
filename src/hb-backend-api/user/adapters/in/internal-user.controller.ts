import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Param } from "@nestjs/common";
import { InternalEndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetUserDto } from "./get-user.dto";
import { GetUserByNicknameUseCase } from "../../domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../domain/model/user-nickname.vo";

@ApiTags("Users")
@Controller(`${InternalEndPointPrefixConstant}/users`)
export class InternalUserController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
  ) {}

  @ApiOperation({
    summary: "Nickname 으로 사용자 조회",
    description: "Nickname 로 사용자 조회",
  })
  @ApiResponse({ type: GetUserDto })
  @ApiParam({ name: "nickname", type: String })
  @Get(":nickname")
  public async findById(
    @Param("nickname") nickname: string,
  ): Promise<GetUserDto> {
    const foundUser = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(nickname),
    );

    return GetUserDto.from(foundUser);
  }
}
