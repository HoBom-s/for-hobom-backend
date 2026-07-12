import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Inject, Patch, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { AddFriendsUseCase } from "../../domain/ports/in/add-friends.use-case";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import { UserId } from "../../domain/model/user-id.vo";
import { AddFriendDto } from "./add-friend.dto";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { UserNickname } from "../../domain/model/user-nickname.vo";
import { GetUserByNicknameUseCase } from "../../domain/ports/in/get-user-by-nickname.use-case";

@ApiTags("Users")
@Controller(`${EndPointPrefixConstant}/users`)
export class AddFriendController {
  constructor(
    @Inject(DIToken.UserModule.AddFriendsUseCase)
    private readonly addFriendsUseCase: AddFriendsUseCase,
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
  ) {}

  @ApiOperation({ summary: "친구 추가", description: "친구 추가하기" })
  @UseGuards(JwtAuthGuard)
  @Patch("friends")
  public async addFriend(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Body() request: AddFriendDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.addFriendsUseCase.invoke(
      user.getId,
      UserId.fromString(request.id),
    );
  }
}
