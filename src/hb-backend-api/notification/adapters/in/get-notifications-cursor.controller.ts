import {
  Controller,
  DefaultValuePipe,
  Get,
  Inject,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { GetNotificationsCursorUseCase } from "../../domain/ports/in/get-notifications-cursor.use-case";
import { NotificationResponseDto } from "./notification-response.dto";
import { CursorPaginatedResponse } from "../../../../shared/pagination/cursor-paginated.response";

@ApiTags("Notifications")
@Controller(`${EndPointPrefixConstant}/notifications`)
export class GetNotificationsCursorController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.NotificationModule.GetNotificationsCursorUseCase)
    private readonly getNotificationsCursorUseCase: GetNotificationsCursorUseCase,
  ) {}

  @ApiOperation({ summary: "알림 목록 커서 페이지네이션 조회" })
  @ApiQuery({ name: "cursor", required: false, type: String })
  @ApiQuery({ name: "size", required: false, type: Number })
  @UseGuards(JwtAuthGuard)
  @Get("scroll")
  public async findWithCursor(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Query("cursor") cursor?: string,
    @Query("size", new DefaultValuePipe(20), ParseIntPipe) size?: number,
  ): Promise<CursorPaginatedResponse<NotificationResponseDto>> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const result = await this.getNotificationsCursorUseCase.invoke(
      user.getId,
      cursor,
      size!,
    );

    return new CursorPaginatedResponse(
      result.data.map(NotificationResponseDto.from),
      result.nextCursor,
      result.hasNext,
    );
  }
}
