import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { GenerateExamUseCase } from "../../domain/ports/in/generate-exam.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LawVersionQueryPort } from "../../domain/ports/out/law-version-query.port";
import { LlmExamPort } from "../../domain/ports/out/llm-exam.port";
import { ExamSetPersistencePort } from "../../domain/ports/out/exam-set-persistence.port";
import { ExamSetEntitySchema } from "../../domain/model/exam-set.entity";

const EXAM_BATCHES = [
  {
    subject: "개인정보 보호법 총칙 및 수집·이용·제공",
    questionCount: 34,
  },
  {
    subject: "안전성 확보조치·영향평가·처리방침",
    questionCount: 33,
  },
  {
    subject: "정보통신망법·신용정보법·관리체계·벌칙",
    questionCount: 33,
  },
];

@Injectable()
export class GenerateExamService implements GenerateExamUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LawVersionQueryPort)
    private readonly lawVersionQueryPort: LawVersionQueryPort,
    @Inject(DIToken.PrivacyLawModule.LlmExamPort)
    private readonly llmExamPort: LlmExamPort,
    @Inject(DIToken.PrivacyLawModule.ExamSetPersistencePort)
    private readonly examSetPersistencePort: ExamSetPersistencePort,
  ) {}

  public async invoke(): Promise<ExamSetEntitySchema> {
    const latestVersion = await this.lawVersionQueryPort.findLatest();
    if (!latestVersion) {
      throw new NotFoundException("수집된 법 조문이 없어요.");
    }

    const articles = latestVersion.getArticles.map((a) => ({
      articleNo: a.getArticleNo,
      articleTitle: a.getTitle,
      content: a.getContent,
    }));

    const allQuestions: {
      subject: string;
      type: string;
      question: string;
      choices: string[];
      answer: string;
      explanation: string;
    }[] = [];

    for (const batch of EXAM_BATCHES) {
      const result = await this.llmExamPort.generateExam({
        articles,
        subject: batch.subject,
        questionCount: batch.questionCount,
      });
      allQuestions.push(...result.questions);
    }

    const numberedQuestions = allQuestions.map((q, i) => ({
      no: i + 1,
      ...q,
    }));

    const currentCount = await this.examSetPersistencePort.countAll();
    const version = currentCount + 1;

    return this.examSetPersistencePort.save({
      title: `제${version}회 CPPG 모의고사`,
      version,
      lawVersionId: latestVersion.getId.toString(),
      totalQuestions: numberedQuestions.length,
      questions: numberedQuestions,
    });
  }
}
