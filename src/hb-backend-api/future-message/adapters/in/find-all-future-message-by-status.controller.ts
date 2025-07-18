import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { FindAllFutureMessageByStatusUseCase } from "../../domain/ports/in/find-all-future-message-by-status.use-case";
import { JwtAuthGuard } from "../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { SendStatus } from "../../domain/model/send-status.enum";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { FindFutureMessageDto } from "./find-future-message.dto";

@ApiTags("FutureMessages")
@Controller(`${EndPointPrefixConstant}/future-messages`)
export class FindAllFutureMessageByStatusController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.FutureMessageModule.FindAllFutureMessageByStatusUseCase)
    private readonly findAllFutureMessageByStatusUseCase: FindAllFutureMessageByStatusUseCase,
  ) {}

  @ApiOperation({
    summary: "미래 메시지 상태별 전부 조회",
    description: "미래 메시지 상태별 전부 조회",
  })
  @UseGuards(JwtAuthGuard)
  @Get("/by-status")
  public async findAll(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Query("status") status: SendStatus,
  ): Promise<FindFutureMessageDto[]> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const foundItems = await this.findAllFutureMessageByStatusUseCase.invoke(
      status,
      user.getId,
    );

    return foundItems.map(FindFutureMessageDto.from);
  }
}
