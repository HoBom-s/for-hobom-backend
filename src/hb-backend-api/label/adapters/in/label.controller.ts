import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { CreateLabelUseCase } from "../../domain/ports/in/create-label.use-case";
import { GetAllLabelsUseCase } from "../../domain/ports/in/get-all-labels.use-case";
import { GetLabelUseCase } from "../../domain/ports/in/get-label.use-case";
import { PatchLabelUseCase } from "../../domain/ports/in/patch-label.use-case";
import { DeleteLabelUseCase } from "../../domain/ports/in/delete-label.use-case";
import { CreateLabelDto } from "./create-label.dto";
import { PatchLabelDto } from "./patch-label.dto";
import { GetLabelDto } from "./get-label.dto";
import { ParseLabelIdPipe } from "./label-id.pipe";
import { LabelId } from "../../domain/model/label-id.vo";
import { LabelTitle } from "../../domain/model/label-title.vo";
import { CreateLabelCommand } from "../../domain/ports/out/create-label.command";
import { PatchLabelCommand } from "../../domain/ports/out/patch-label.command";

@ApiTags("Labels")
@Controller(`${EndPointPrefixConstant}/labels`)
@UseGuards(JwtAuthGuard)
export class LabelController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.LabelModule.CreateLabelUseCase)
    private readonly createLabelUseCase: CreateLabelUseCase,
    @Inject(DIToken.LabelModule.GetAllLabelsUseCase)
    private readonly getAllLabelsUseCase: GetAllLabelsUseCase,
    @Inject(DIToken.LabelModule.GetLabelUseCase)
    private readonly getLabelUseCase: GetLabelUseCase,
    @Inject(DIToken.LabelModule.PatchLabelUseCase)
    private readonly patchLabelUseCase: PatchLabelUseCase,
    @Inject(DIToken.LabelModule.DeleteLabelUseCase)
    private readonly deleteLabelUseCase: DeleteLabelUseCase,
  ) {}

  @ApiOperation({ summary: "라벨 생성" })
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Body() body: CreateLabelDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.createLabelUseCase.invoke(
      CreateLabelCommand.of(LabelTitle.fromString(body.title), user.getId),
    );
  }

  @ApiOperation({ summary: "모든 라벨 조회" })
  @ApiResponse({ type: [GetLabelDto] })
  @Get("")
  public async getAll(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<GetLabelDto[]> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const labels = await this.getAllLabelsUseCase.invoke(user.getId);
    return labels.map(GetLabelDto.from);
  }

  @ApiOperation({ summary: "라벨 단건 조회" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ type: GetLabelDto })
  @Get(":id")
  public async getOne(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseLabelIdPipe) id: LabelId,
  ): Promise<GetLabelDto> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const label = await this.getLabelUseCase.invoke(id, user.getId);
    return GetLabelDto.from(label);
  }

  @ApiOperation({ summary: "라벨 수정" })
  @ApiParam({ name: "id", type: String })
  @Patch(":id")
  public async update(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseLabelIdPipe) id: LabelId,
    @Body() body: PatchLabelDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.patchLabelUseCase.invoke(
      id,
      PatchLabelCommand.of(LabelTitle.fromString(body.title), user.getId),
    );
  }

  @ApiOperation({ summary: "라벨 삭제" })
  @ApiParam({ name: "id", type: String })
  @Delete(":id")
  public async delete(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseLabelIdPipe) id: LabelId,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.deleteLabelUseCase.invoke(id, user.getId);
  }
}
