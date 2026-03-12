import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { StudyMaterialId } from "./study-material-id.vo";
import { LawDiffId } from "./law-diff-id.vo";

@Schema({ collection: "study_materials" })
export class StudyMaterialEntity extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: "LawDiffEntity", required: true })
  diffId: Types.ObjectId;

  @Prop({ type: String, required: true })
  summary: string;

  @Prop({ type: [String], default: [] })
  keyPoints: string[];

  @Prop({
    type: [
      {
        type: { type: String },
        question: String,
        answer: String,
        explanation: String,
        choices: [String],
      },
    ],
    default: [],
  })
  quizzes: {
    type: string;
    question: string;
    answer: string;
    explanation: string;
    choices: string[];
  }[];
}

export class StudyMaterialEntitySchema {
  constructor(
    private readonly id: StudyMaterialId,
    private readonly diffId: LawDiffId,
    private readonly summary: string,
    private readonly keyPoints: string[],
    private readonly quizzes: {
      type: string;
      question: string;
      answer: string;
      explanation: string;
      choices: string[];
    }[],
  ) {}

  public static of(
    id: StudyMaterialId,
    diffId: LawDiffId,
    summary: string,
    keyPoints: string[],
    quizzes: {
      type: string;
      question: string;
      answer: string;
      explanation: string;
      choices: string[];
    }[],
  ): StudyMaterialEntitySchema {
    return new StudyMaterialEntitySchema(
      id,
      diffId,
      summary,
      keyPoints,
      quizzes,
    );
  }

  get getId(): StudyMaterialId {
    return this.id;
  }
  get getDiffId(): LawDiffId {
    return this.diffId;
  }
  get getSummary(): string {
    return this.summary;
  }
  get getKeyPoints(): string[] {
    return this.keyPoints;
  }
  get getQuizzes(): {
    type: string;
    question: string;
    answer: string;
    explanation: string;
    choices: string[];
  }[] {
    return this.quizzes;
  }
}
