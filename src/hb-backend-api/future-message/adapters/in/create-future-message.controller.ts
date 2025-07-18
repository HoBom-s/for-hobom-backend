import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { CreateFutureMessageUseCase } from "../../domain/ports/in/create-future-message.use-case";
import { JwtAuthGuard } from "../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { CreateFutureMessageDto } from "./create-future-message.dto";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { CreateFutureMessageCommand } from "../../domain/ports/out/create-future-message.command";
import { SendStatus } from "../../domain/model/send-status.enum";
import { UserId } from "../../../user/domain/model/user-id.vo";

@ApiTags("FutureMessages")
@Controller(`${EndPointPrefixConstant}/future-messages`)
export class CreateFutureMessageController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.FutureMessageModule.CreateFutureMessageUseCase)
    private readonly createFutureMessageUseCase: CreateFutureMessageUseCase,
  ) {}

  @ApiOperation({
    summary: "미래 메시지 생성",
    description: "미래 메시지 생성",
  })
  @UseGuards(JwtAuthGuard)
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Body() body: CreateFutureMessageDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const command = new CreateFutureMessageCommand(
      user.getId,
      UserId.fromString(body.recipientId),
      body.title,
      body.content,
      SendStatus.PENDING,
      body.scheduledAt,
    );

    await this.createFutureMessageUseCase.invoke(command);
  }
}
