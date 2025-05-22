import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { CreateUserUseCase } from "../../../application/ports/in/create-user.use-case";
import { CreateUserDto } from "../dto/create-user.dto";
import { CreateUserCommand } from "../../../application/command/create-user.command";
import { GetUserUseCase } from "../../../application/ports/in/get-user.use-case";
import { GetUserDto } from "../dto/get-user.dto";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { DIToken } from "../../../../../shared/di/token.di";
import { UserId } from "../../../domain/vo/user-id.vo";
import { ParseUserIdPipe } from "../pipe/user-id.pipe";

@ApiTags("Users")
@Controller(`${EndPointPrefixConstant}/users`)
export class UserController {
  constructor(
    @Inject(DIToken.UserModule.CreateUserUseCase)
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(DIToken.UserModule.GetUserUseCase)
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  @ApiOperation({ description: "UserId 로 사용자 조회" })
  @ApiParam({ name: "id", type: String })
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  public async findById(
    @Param("id", ParseUserIdPipe) id: UserId,
  ): Promise<GetUserDto> {
    const foundUser = await this.getUserUseCase.invoke(id);

    return GetUserDto.from(foundUser);
  }

  @ApiOperation({ description: "사용자 생성" })
  @Post("")
  public async createUser(@Body() body: CreateUserDto): Promise<void> {
    const { username, password, nickname } = body;
    const command = CreateUserCommand.of(username, nickname, password);

    await this.createUserUseCase.invoke(command);
  }
}
