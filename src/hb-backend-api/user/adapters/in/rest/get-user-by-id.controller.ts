import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { GetUserUseCase } from "../../../application/ports/in/get-user.use-case";
import { GetUserDto } from "../dto/get-user.dto";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { ParseUserIdPipe } from "../pipe/user-id.pipe";
import { UserId } from "../../../domain/vo/user-id.vo";

@ApiTags("Users")
@Controller(`${EndPointPrefixConstant}/users`)
export class GetUserByIdController {
  constructor(
    @Inject(DIToken.UserModule.GetUserUseCase)
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  @ApiOperation({
    summary: "UserId 로 사용자 조회",
    description: "UserId 로 사용자 조회",
  })
  @ApiResponse({ type: GetUserDto })
  @ApiParam({ name: "id", type: String })
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  public async findById(
    @Param("id", ParseUserIdPipe) id: UserId,
  ): Promise<GetUserDto> {
    const foundUser = await this.getUserUseCase.invoke(id);

    return GetUserDto.from(foundUser);
  }
}
