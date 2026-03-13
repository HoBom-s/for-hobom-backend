import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { ExamSetId } from "./exam-set-id.vo";

@Schema({ collection: "exam_sets" })
export class ExamSetEntity extends BaseEntity {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, required: true })
  version: number;

  @Prop({ type: Types.ObjectId, ref: "LawVersionEntity", required: true })
  lawVersionId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  totalQuestions: number;

  @Prop({
    type: [
      {
        no: { type: Number, required: true },
        subject: { type: String, required: true },
        type: {
          type: String,
          required: true,
          enum: ["OX", "MULTIPLE_CHOICE"],
        },
        question: { type: String, required: true },
        choices: { type: [String], default: [] },
        answer: { type: String, required: true },
        explanation: { type: String, required: true },
      },
    ],
    default: [],
  })
  questions: {
    no: number;
    subject: string;
    type: string;
    question: string;
    choices: string[];
    answer: string;
    explanation: string;
  }[];
}

export class ExamSetEntitySchema {
  constructor(
    private readonly id: ExamSetId,
    private readonly title: string,
    private readonly version: number,
    private readonly lawVersionId: string,
    private readonly totalQuestions: number,
    private readonly questions: {
      no: number;
      subject: string;
      type: string;
      question: string;
      choices: string[];
      answer: string;
      explanation: string;
    }[],
    private readonly createdAt: Date,
  ) {}

  public static of(
    id: ExamSetId,
    title: string,
    version: number,
    lawVersionId: string,
    totalQuestions: number,
    questions: {
      no: number;
      subject: string;
      type: string;
      question: string;
      choices: string[];
      answer: string;
      explanation: string;
    }[],
    createdAt: Date,
  ): ExamSetEntitySchema {
    return new ExamSetEntitySchema(
      id,
      title,
      version,
      lawVersionId,
      totalQuestions,
      questions,
      createdAt,
    );
  }

  get getId(): ExamSetId {
    return this.id;
  }
  get getTitle(): string {
    return this.title;
  }
  get getVersion(): number {
    return this.version;
  }
  get getLawVersionId(): string {
    return this.lawVersionId;
  }
  get getTotalQuestions(): number {
    return this.totalQuestions;
  }
  get getQuestions(): {
    no: number;
    subject: string;
    type: string;
    question: string;
    choices: string[];
    answer: string;
    explanation: string;
  }[] {
    return this.questions;
  }
  get getCreatedAt(): Date {
    return this.createdAt;
  }
}
