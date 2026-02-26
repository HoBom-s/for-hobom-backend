import { Controller, Inject, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { ReadNotificationUseCase } from "../../domain/ports/in/read-notification.use-case";
import { NotificationId } from "../../domain/model/notification-id.vo";

@ApiTags("Notifications")
@Controller(`${EndPointPrefixConstant}/notifications`)
export class ReadNotificationController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.NotificationModule.ReadNotificationUseCase)
    private readonly readNotificationUseCase: ReadNotificationUseCase,
  ) {}

  @ApiOperation({ summary: "알림 읽음 처리" })
  @UseGuards(JwtAuthGuard)
  @Patch(":id/read")
  public async markAsRead(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id") id: string,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.readNotificationUseCase.invoke(
      NotificationId.fromString(id),
      user.getId,
    );
  }
}
