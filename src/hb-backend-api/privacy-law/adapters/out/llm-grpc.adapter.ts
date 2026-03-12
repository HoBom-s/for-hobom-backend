import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { firstValueFrom, Observable } from "rxjs";
import { LlmPort } from "../../domain/ports/out/llm.port";

interface StudyMaterialGrpcRequest {
  changes: {
    articleNo: string;
    changeType: string;
    before: string;
    after: string;
  }[];
}

interface StudyMaterialGrpcResponse {
  summary: string;
  keyPoints: string[];
  quizzes: {
    type: string;
    question: string;
    answer: string;
    explanation: string;
    choices: string[];
  }[];
}

interface AskQuestionGrpcRequest {
  question: string;
  articles: {
    articleNo: string;
    articleTitle: string;
    content: string;
  }[];
  recentChanges: {
    articleNo: string;
    changeType: string;
    before: string;
    after: string;
  }[];
}

interface AskQuestionGrpcResponse {
  answer: string;
  referencedArticles: string[];
}

interface StudyMaterialService {
  generate(
    request: StudyMaterialGrpcRequest,
  ): Observable<StudyMaterialGrpcResponse>;
}

interface AskQuestionService {
  ask(
    request: AskQuestionGrpcRequest,
  ): Observable<AskQuestionGrpcResponse>;
}

@Injectable()
export class LlmGrpcAdapter implements LlmPort, OnModuleInit {
  private studyMaterialService: StudyMaterialService;
  private askQuestionService: AskQuestionService;

  constructor(
    @Inject("LLM_PACKAGE") private readonly client: ClientGrpc,
  ) {}

  public onModuleInit(): void {
    this.studyMaterialService =
      this.client.getService<StudyMaterialService>("StudyMaterialService");
    this.askQuestionService =
      this.client.getService<AskQuestionService>("AskQuestionService");
  }

  public async generateStudyMaterial(
    changes: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[],
  ): Promise<{
    summary: string;
    keyPoints: string[];
    quizzes: {
      type: string;
      question: string;
      answer: string;
      explanation: string;
      choices: string[];
    }[];
  }> {
    return firstValueFrom(
      this.studyMaterialService.generate({ changes }),
    );
  }

  public async ask(request: {
    question: string;
    articles: {
      articleNo: string;
      articleTitle: string;
      content: string;
    }[];
    recentChanges: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[];
  }): Promise<{ answer: string; referencedArticles: string[] }> {
    return firstValueFrom(this.askQuestionService.ask(request));
  }
}
