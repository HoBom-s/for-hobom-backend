import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { CreateNotificationUseCase } from "../../domain/ports/in/create-notification.use-case";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { CreateNotificationDto } from "./create-notification.dto";
import { CreateNotificationCommand } from "../../domain/ports/out/create-notification.command";
import { NotificationCategory } from "../../domain/enums/notification-category.enum";

@ApiTags("Notifications")
@Controller(`${EndPointPrefixConstant}/internal/notifications`)
export class CreateNotificationController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.NotificationModule.CreateNotificationUseCase)
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  @ApiOperation({ summary: "알림 생성 (내부 서비스 호출)" })
  @Post("")
  public async create(@Body() body: CreateNotificationDto): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(body.recipient),
    );
    await this.createNotificationUseCase.invoke(
      CreateNotificationCommand.of(
        body.category ?? NotificationCategory.SYSTEM,
        user.getId,
        body.title,
        body.body,
        body.senderId,
        body.recipient,
      ),
    );
  }
}
