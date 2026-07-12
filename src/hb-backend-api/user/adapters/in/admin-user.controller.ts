import {
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import { AdminGuard } from "../../../../shared/adapters/in/rest/guard/admin.guard";
import { DIToken } from "../../../../shared/di/token.di";
import { ApproveUserUseCase } from "../../domain/ports/in/approve-user.use-case";
import { RejectUserUseCase } from "../../domain/ports/in/reject-user.use-case";
import { GetPendingUsersUseCase } from "../../domain/ports/in/get-pending-users.use-case";
import { UserId } from "../../domain/model/user-id.vo";
import { GetPendingUserDto } from "./get-pending-user.dto";

@ApiTags("Admin")
@Controller(`${EndPointPrefixConstant}/admin/users`)
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUserController {
  constructor(
    @Inject(DIToken.UserModule.ApproveUserUseCase)
    private readonly approveUserUseCase: ApproveUserUseCase,
    @Inject(DIToken.UserModule.RejectUserUseCase)
    private readonly rejectUserUseCase: RejectUserUseCase,
    @Inject(DIToken.UserModule.GetPendingUsersUseCase)
    private readonly getPendingUsersUseCase: GetPendingUsersUseCase,
  ) {}

  @ApiOperation({
    summary: "승인 대기 사용자 목록 조회",
    description: "관리자 전용: 승인 대기 중인 사용자 목록",
  })
  @ApiOkResponse({ type: [GetPendingUserDto] })
  @Get("/pending")
  public async getPendingUsers(): Promise<GetPendingUserDto[]> {
    const users = await this.getPendingUsersUseCase.invoke();
    return users.map(GetPendingUserDto.from);
  }

  @ApiOperation({
    summary: "사용자 승인",
    description: "관리자 전용: 사용자 승인",
  })
  @Patch("/:id/approve")
  public async approveUser(@Param("id") id: string): Promise<void> {
    await this.approveUserUseCase.invoke(UserId.fromString(id));
  }

  @ApiOperation({
    summary: "사용자 거절",
    description: "관리자 전용: 사용자 거절",
  })
  @Patch("/:id/reject")
  public async rejectUser(@Param("id") id: string): Promise<void> {
    await this.rejectUserUseCase.invoke(UserId.fromString(id));
  }
}
