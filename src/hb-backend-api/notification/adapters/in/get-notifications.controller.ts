import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { GetAllNotificationsUseCase } from "../../domain/ports/in/get-all-notifications.use-case";
import { NotificationResponseDto } from "./notification-response.dto";

@ApiTags("Notifications")
@Controller(`${EndPointPrefixConstant}/notifications`)
export class GetNotificationsController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.NotificationModule.GetAllNotificationsUseCase)
    private readonly getAllNotificationsUseCase: GetAllNotificationsUseCase,
  ) {}

  @ApiOperation({ summary: "알림 목록 조회" })
  @ApiResponse({ type: [NotificationResponseDto] })
  @UseGuards(JwtAuthGuard)
  @Get("")
  public async findAll(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<NotificationResponseDto[]> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const results = await this.getAllNotificationsUseCase.invoke(user.getId);
    return results.map(NotificationResponseDto.from);
  }
}
