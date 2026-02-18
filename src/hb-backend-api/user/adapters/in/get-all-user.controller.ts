import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetUserDto } from "./get-user.dto";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import { GetAllUserUseCase } from "../../domain/ports/in/get-all-user.use-case";

@ApiTags("Users")
@Controller(`${EndPointPrefixConstant}/users`)
export class GetAllUserController {
  constructor(
    @Inject(DIToken.UserModule.GetAllUserUseCase)
    private readonly getAllUserUseCase: GetAllUserUseCase,
  ) {}

  @ApiOperation({
    summary: "모든 사용자 조회",
    description: "모든 사용자 조회",
  })
  @ApiResponse({ type: GetUserDto })
  @UseGuards(JwtAuthGuard)
  @Get("")
  public async findById(): Promise<GetUserDto[]> {
    const founds = await this.getAllUserUseCase.invoke();

    return founds.map((foundUser) => GetUserDto.from(foundUser));
  }
}
