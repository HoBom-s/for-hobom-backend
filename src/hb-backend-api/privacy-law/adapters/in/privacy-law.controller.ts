import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetLawVersionsUseCase } from "../../domain/ports/in/get-law-versions.use-case";
import { GetLawVersionByIdUseCase } from "../../domain/ports/in/get-law-version-by-id.use-case";
import { GetLawDiffsUseCase } from "../../domain/ports/in/get-law-diffs.use-case";
import { GetLawDiffByIdUseCase } from "../../domain/ports/in/get-law-diff-by-id.use-case";
import { GetStudyMaterialsUseCase } from "../../domain/ports/in/get-study-materials.use-case";
import { GetStudyMaterialByIdUseCase } from "../../domain/ports/in/get-study-material-by-id.use-case";
import { AskQuestionUseCase } from "../../domain/ports/in/ask-question.use-case";
import { FetchLawVersionUseCase } from "../../domain/ports/in/fetch-law-version.use-case";
import { LawVersionId } from "../../domain/model/law-version-id.vo";
import { LawDiffId } from "../../domain/model/law-diff-id.vo";
import { StudyMaterialId } from "../../domain/model/study-material-id.vo";
import { LawVersionEntitySchema } from "../../domain/model/law-version.entity";
import { LawDiffEntitySchema } from "../../domain/model/law-diff.entity";
import { StudyMaterialEntitySchema } from "../../domain/model/study-material.entity";
import { ParseLawVersionIdPipe } from "./dto/law-version-id.pipe";
import { ParseLawDiffIdPipe } from "./dto/law-diff-id.pipe";
import { ParseStudyMaterialIdPipe } from "./dto/study-material-id.pipe";
import { AskQuestionDto } from "./dto/ask-question.dto";
import { AskQuestionResponseDto } from "./dto/ask-question-response.dto";

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
    @Inject(DIToken.PrivacyLawModule.FetchLawVersionUseCase)
    private readonly fetchLawVersionUseCase: FetchLawVersionUseCase,
  ) {}

  @ApiOperation({ summary: "법률 버전 목록 조회" })
  @ApiResponse({ type: [LawVersionEntitySchema] })
  @Get("versions")
  public async getVersions(): Promise<LawVersionEntitySchema[]> {
    return this.getLawVersionsUseCase.invoke();
  }

  @ApiOperation({ summary: "법률 버전 단건 조회" })
  @ApiResponse({ type: LawVersionEntitySchema })
  @Get("versions/:id")
  public async getVersionById(
    @Param("id", ParseLawVersionIdPipe) id: LawVersionId,
  ): Promise<LawVersionEntitySchema> {
    return this.getLawVersionByIdUseCase.invoke(id);
  }

  @ApiOperation({ summary: "법률 변경 이력 목록 조회" })
  @ApiResponse({ type: [LawDiffEntitySchema] })
  @Get("diffs")
  public async getDiffs(): Promise<LawDiffEntitySchema[]> {
    return this.getLawDiffsUseCase.invoke();
  }

  @ApiOperation({ summary: "법률 변경 이력 단건 조회" })
  @ApiResponse({ type: LawDiffEntitySchema })
  @Get("diffs/:id")
  public async getDiffById(
    @Param("id", ParseLawDiffIdPipe) id: LawDiffId,
  ): Promise<LawDiffEntitySchema> {
    return this.getLawDiffByIdUseCase.invoke(id);
  }

  @ApiOperation({ summary: "학습 자료 목록 조회" })
  @ApiResponse({ type: [StudyMaterialEntitySchema] })
  @Get("study-materials")
  public async getStudyMaterials(): Promise<StudyMaterialEntitySchema[]> {
    return this.getStudyMaterialsUseCase.invoke();
  }

  @ApiOperation({ summary: "학습 자료 단건 조회" })
  @ApiResponse({ type: StudyMaterialEntitySchema })
  @Get("study-materials/:id")
  public async getStudyMaterialById(
    @Param("id", ParseStudyMaterialIdPipe) id: StudyMaterialId,
  ): Promise<StudyMaterialEntitySchema> {
    return this.getStudyMaterialByIdUseCase.invoke(id);
  }

  @ApiOperation({ summary: "개인정보보호법 질문" })
  @ApiResponse({ type: AskQuestionResponseDto })
  @Post("ask")
  public async askQuestion(
    @Body() body: AskQuestionDto,
  ): Promise<{ answer: string; referencedArticles: string[] }> {
    return this.askQuestionUseCase.invoke(body.question);
  }

  @ApiOperation({ summary: "법률 데이터 수동 수집" })
  @Post("fetch")
  public async fetchLawVersion(): Promise<void> {
    await this.fetchLawVersionUseCase.invoke();
  }
}
