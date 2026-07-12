import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller,
  Inject,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UpdateFutureMessageUseCase } from "../../domain/ports/in/update-future-message.use-case";
import { UpdateFutureMessageDto } from "./update-future-message.dto";
import { ParseFutureMessageIdPipe } from "./future-message-id.pipe";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { UpdateFutureMessageCommand } from "../../domain/ports/out/update-future-message.command";

@ApiTags("FutureMessages")
@Controller(`${EndPointPrefixConstant}/future-messages`)
export class UpdateFutureMessageController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.FutureMessageModule.UpdateFutureMessageUseCase)
    private readonly updateFutureMessageUseCase: UpdateFutureMessageUseCase,
  ) {}

  @ApiOperation({
    summary: "미래 메시지 수정",
    description: "PENDING 상태의 미래 메시지 수정 (제목, 내용, 발송 예정일)",
  })
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  public async update(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseFutureMessageIdPipe) id: FutureMessageId,
    @Body() body: UpdateFutureMessageDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    await this.updateFutureMessageUseCase.invoke(
      id,
      user.getId,
      UpdateFutureMessageCommand.of(body.title, body.content, body.scheduledAt),
    );
  }
}
