import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { CreateUserUseCase } from "../../../application/ports/in/create-user.use-case";
import { CreateUserDto } from "../dto/create-user.dto";
import { CreateUserCommand } from "../../../application/command/create-user.command";
import { DIToken } from "../../../../../shared/di/token.di";

@ApiTags("Users")
@Controller(`${EndPointPrefixConstant}/users`)
export class CreateUserController {
  constructor(
    @Inject(DIToken.UserModule.CreateUserUseCase)
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @ApiOperation({
    summary: "사용자 생성",
    description: "사용자 생성",
  })
  @Post("")
  public async createUser(@Body() body: CreateUserDto): Promise<void> {
    const { username, password, nickname } = body;
    const command = CreateUserCommand.of(username, nickname, password);

    await this.createUserUseCase.invoke(command);
  }
}
