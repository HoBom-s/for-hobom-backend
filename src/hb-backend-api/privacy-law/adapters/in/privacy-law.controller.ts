import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetLawVersionsUseCase } from "../../domain/ports/in/get-law-versions.use-case";
import { GetLawVersionByIdUseCase } from "../../domain/ports/in/get-law-version-by-id.use-case";
import { GetLawDiffsUseCase } from "../../domain/ports/in/get-law-diffs.use-case";
import { GetLawDiffByIdUseCase } from "../../domain/ports/in/get-law-diff-by-id.use-case";
import { GetStudyMaterialsUseCase } from "../../domain/ports/in/get-study-materials.use-case";
import { GetStudyMaterialByIdUseCase } from "../../domain/ports/in/get-study-material-by-id.use-case";
import { AskQuestionUseCase } from "../../domain/ports/in/ask-question.use-case";
import { GetQuestionHistoriesUseCase } from "../../domain/ports/in/get-question-histories.use-case";
import { FetchLawVersionUseCase } from "../../domain/ports/in/fetch-law-version.use-case";
import { LawVersionId } from "../../domain/model/law-version-id.vo";
import { LawDiffId } from "../../domain/model/law-diff-id.vo";
import { StudyMaterialId } from "../../domain/model/study-material-id.vo";
import { ParseLawVersionIdPipe } from "./dto/law-version-id.pipe";
import { ParseLawDiffIdPipe } from "./dto/law-diff-id.pipe";
import { ParseStudyMaterialIdPipe } from "./dto/study-material-id.pipe";
import { GetLawVersionDto } from "./dto/get-law-version.dto";
import { GetLawDiffDto } from "./dto/get-law-diff.dto";
import { GetStudyMaterialDto } from "./dto/get-study-material.dto";
import { AskQuestionDto } from "./dto/ask-question.dto";
import { AskQuestionResponseDto } from "./dto/ask-question-response.dto";
import { GetQuestionHistoryDto } from "./dto/get-question-history.dto";

@ApiTags("Privacy Law")
@Controller(`${EndPointPrefixConstant}/privacy-law`)
export class PrivacyLawController {
  constructor(
    @Inject(DIToken.PrivacyLawModule.GetLawVersionsUseCase)
    private readonly getLawVersionsUseCase: GetLawVersionsUseCase,
    @Inject(DIToken.PrivacyLawModule.GetLawVersionByIdUseCase)
    private readonly getLawVersionByIdUseCase: GetLawVersionByIdUseCase,
    @Inject(DIToken.PrivacyLawModule.GetLawDiffsUseCase)
    private readonly getLawDiffsUseCase: GetLawDiffsUseCase,
    @Inject(DIToken.PrivacyLawModule.GetLawDiffByIdUseCase)
    private readonly getLawDiffByIdUseCase: GetLawDiffByIdUseCase,
    @Inject(DIToken.PrivacyLawModule.GetStudyMaterialsUseCase)
    private readonly getStudyMaterialsUseCase: GetStudyMaterialsUseCase,
    @Inject(DIToken.PrivacyLawModule.GetStudyMaterialByIdUseCase)
    private readonly getStudyMaterialByIdUseCase: GetStudyMaterialByIdUseCase,
    @Inject(DIToken.PrivacyLawModule.AskQuestionUseCase)
    private readonly askQuestionUseCase: AskQuestionUseCase,
    @Inject(DIToken.PrivacyLawModule.GetQuestionHistoriesUseCase)
    private readonly getQuestionHistoriesUseCase: GetQuestionHistoriesUseCase,
    @Inject(DIToken.PrivacyLawModule.FetchLawVersionUseCase)
    private readonly fetchLawVersionUseCase: FetchLawVersionUseCase,
  ) {}

  @ApiOperation({ summary: "법률 버전 목록 조회" })
  @ApiResponse({ type: [GetLawVersionDto] })
  @Get("versions")
  public async getVersions(): Promise<GetLawVersionDto[]> {
    const versions = await this.getLawVersionsUseCase.invoke();
    return versions.map(GetLawVersionDto.from);
  }

  @ApiOperation({ summary: "법률 버전 단건 조회" })
  @ApiResponse({ type: GetLawVersionDto })
  @Get("versions/:id")
  public async getVersionById(
    @Param("id", ParseLawVersionIdPipe) id: LawVersionId,
  ): Promise<GetLawVersionDto> {
    const version = await this.getLawVersionByIdUseCase.invoke(id);
    return GetLawVersionDto.from(version);
  }

  @ApiOperation({ summary: "법률 변경 이력 목록 조회" })
  @ApiResponse({ type: [GetLawDiffDto] })
  @Get("diffs")
  public async getDiffs(): Promise<GetLawDiffDto[]> {
    const diffs = await this.getLawDiffsUseCase.invoke();
    return diffs.map(GetLawDiffDto.from);
  }

  @ApiOperation({ summary: "법률 변경 이력 단건 조회" })
  @ApiResponse({ type: GetLawDiffDto })
  @Get("diffs/:id")
  public async getDiffById(
    @Param("id", ParseLawDiffIdPipe) id: LawDiffId,
  ): Promise<GetLawDiffDto> {
    const diff = await this.getLawDiffByIdUseCase.invoke(id);
    return GetLawDiffDto.from(diff);
  }

  @ApiOperation({ summary: "학습 자료 목록 조회" })
  @ApiResponse({ type: [GetStudyMaterialDto] })
  @Get("study-materials")
  public async getStudyMaterials(): Promise<GetStudyMaterialDto[]> {
    const materials = await this.getStudyMaterialsUseCase.invoke();
    return materials.map(GetStudyMaterialDto.from);
  }

  @ApiOperation({ summary: "학습 자료 단건 조회" })
  @ApiResponse({ type: GetStudyMaterialDto })
  @Get("study-materials/:id")
  public async getStudyMaterialById(
    @Param("id", ParseStudyMaterialIdPipe) id: StudyMaterialId,
  ): Promise<GetStudyMaterialDto> {
    const material = await this.getStudyMaterialByIdUseCase.invoke(id);
    return GetStudyMaterialDto.from(material);
  }

  @ApiOperation({ summary: "질문 이력 목록 조회" })
  @ApiResponse({ type: [GetQuestionHistoryDto] })
  @UseGuards(JwtAuthGuard)
  @Get("questions")
  public async getQuestionHistories(): Promise<GetQuestionHistoryDto[]> {
    const histories = await this.getQuestionHistoriesUseCase.invoke();
    return histories.map(GetQuestionHistoryDto.from);
  }

  @ApiOperation({ summary: "개인정보보호법 질문" })
  @ApiResponse({ type: AskQuestionResponseDto })
  @UseGuards(JwtAuthGuard)
  @Post("ask")
  public async askQuestion(
    @Body() body: AskQuestionDto,
  ): Promise<{ answer: string; referencedArticles: string[] }> {
    return this.askQuestionUseCase.invoke(body.question);
  }

  @ApiOperation({ summary: "법률 데이터 수동 수집" })
  @UseGuards(JwtAuthGuard)
  @Post("fetch")
  public async fetchLawVersion(): Promise<void> {
    await this.fetchLawVersionUseCase.invoke();
  }
}
