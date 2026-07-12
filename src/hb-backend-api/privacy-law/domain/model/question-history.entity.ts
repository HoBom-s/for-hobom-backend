import { Prop, Schema } from "@nestjs/mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { QuestionHistoryId } from "./question-history-id.vo";

@Schema({ collection: "question_histories" })
export class QuestionHistoryEntity extends BaseEntity {
  @Prop({ type: String, required: true })
  question: string;

  @Prop({ type: String, required: true })
  answer: string;

  @Prop({ type: [String], default: [] })
  referencedArticles: string[];
}

export class QuestionHistoryEntitySchema {
  constructor(
    private readonly id: QuestionHistoryId,
    private readonly question: string,
    private readonly answer: string,
    private readonly referencedArticles: string[],
    private readonly createdAt: Date,
  ) {}

  public static of(
    id: QuestionHistoryId,
    question: string,
    answer: string,
    referencedArticles: string[],
    createdAt: Date,
  ): QuestionHistoryEntitySchema {
    return new QuestionHistoryEntitySchema(
      id,
      question,
      answer,
      referencedArticles,
      createdAt,
    );
  }

  get getId(): QuestionHistoryId {
    return this.id;
  }
  get getQuestion(): string {
    return this.question;
  }
  get getAnswer(): string {
    return this.answer;
  }
  get getReferencedArticles(): string[] {
    return this.referencedArticles;
  }
  get getCreatedAt(): Date {
    return this.createdAt;
  }
}
