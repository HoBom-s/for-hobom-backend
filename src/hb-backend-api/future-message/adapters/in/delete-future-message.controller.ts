import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller, Delete, Inject, Param, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { DeleteFutureMessageUseCase } from "../../domain/ports/in/delete-future-message.use-case";
import { ParseFutureMessageIdPipe } from "./future-message-id.pipe";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";

@ApiTags("FutureMessages")
@Controller(`${EndPointPrefixConstant}/future-messages`)
export class DeleteFutureMessageController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.FutureMessageModule.DeleteFutureMessageUseCase)
    private readonly deleteFutureMessageUseCase: DeleteFutureMessageUseCase,
  ) {}

  @ApiOperation({
    summary: "미래 메시지 삭제",
    description: "PENDING 상태의 미래 메시지 삭제",
  })
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  public async delete(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseFutureMessageIdPipe) id: FutureMessageId,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    await this.deleteFutureMessageUseCase.invoke(id, user.getId);
  }
}
