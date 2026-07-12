import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetDlqListUseCase } from "../../domain/ports/in/get-dlq-list.use-case";
import { GetDlqDetailUseCase } from "../../domain/ports/in/get-dlq-detail.use-case";
import { RetryDlqUseCase } from "../../domain/ports/in/retry-dlq.use-case";
import { GetDlqListDto, GetDlqDetailDto, RetryDlqDto } from "./dto/dlq.dto";

@ApiTags("DLQ Management")
@UseGuards(JwtAuthGuard)
@Controller(`${EndPointPrefixConstant}/dlq`)
export class DlqController {
  constructor(
    @Inject(DIToken.DlqModule.GetDlqListUseCase)
    private readonly getDlqListUseCase: GetDlqListUseCase,
    @Inject(DIToken.DlqModule.GetDlqDetailUseCase)
    private readonly getDlqDetailUseCase: GetDlqDetailUseCase,
    @Inject(DIToken.DlqModule.RetryDlqUseCase)
    private readonly retryDlqUseCase: RetryDlqUseCase,
  ) {}

  @ApiOperation({ summary: "DLQ 키 목록 조회" })
  @ApiResponse({ type: GetDlqListDto })
  @Get()
  public async getList(
    @Query("prefix") prefix?: string,
  ): Promise<GetDlqListDto> {
    const result = await this.getDlqListUseCase.invoke(prefix);
    return GetDlqListDto.from(result);
  }

  @ApiOperation({ summary: "DLQ 단건 조회" })
  @ApiResponse({ type: GetDlqDetailDto })
  @Get(":key")
  public async getByKey(@Param("key") key: string): Promise<GetDlqDetailDto> {
    const result = await this.getDlqDetailUseCase.invoke(key);
    return GetDlqDetailDto.from(key, result);
  }

  @ApiOperation({ summary: "DLQ 재시도" })
  @ApiResponse({ type: RetryDlqDto })
  @Post(":key/retry")
  public async retry(@Param("key") key: string): Promise<RetryDlqDto> {
    const result = await this.retryDlqUseCase.invoke(key);
    return RetryDlqDto.from(result);
  }
}
