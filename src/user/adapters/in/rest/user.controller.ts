import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { CreateUserUseCase } from "../../../application/ports/in/create-user.use-case";
import { ResponseEntity } from "../../../../shared/response/response.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { CreateUserCommand } from "../../../application/command/create-user.command";
import { GetUserUseCase } from "../../../application/ports/in/get-user.use-case";
import { GetUserDto } from "../dto/get-user.dto";

@Controller(`${EndPointPrefixConstant}/user`)
export class UserController {
  constructor(
    @Inject("CreateUserUseCase")
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject("GetUserUseCase")
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  @Get(`:id`)
  public async findById(
    @Param("id") id: string,
  ): Promise<ResponseEntity<GetUserDto>> {
    const foundUser = await this.getUserUseCase.invoke(id);

    return ResponseEntity.ok<GetUserDto>(GetUserDto.from(foundUser));
  }

  @Post("")
  public async createUser(
    @Body() body: CreateUserDto,
  ): Promise<ResponseEntity<void>> {
    const { username, password, nickname } = body;
    const command = CreateUserCommand.of(username, nickname, password);

    await this.createUserUseCase.invoke(command);

    return ResponseEntity.ok<void>(undefined);
  }
}
