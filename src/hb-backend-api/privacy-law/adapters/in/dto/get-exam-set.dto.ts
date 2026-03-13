import { ApiProperty } from "@nestjs/swagger";
import { ExamSetEntitySchema } from "../../../domain/model/exam-set.entity";

class ExamQuestionDto {
  @ApiProperty({ type: Number })
  no: number;

  @ApiProperty({ type: String })
  subject: string;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  question: string;

  @ApiProperty({ type: [String] })
  choices: string[];

  @ApiProperty({ type: String })
  answer: string;

  @ApiProperty({ type: String })
  explanation: string;
}

export class GetExamSetDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: Number })
  version: number;

  @ApiProperty({ type: Number })
  totalQuestions: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  constructor(data: Partial<GetExamSetDto>) {
    Object.assign(this, data);
  }

  public static from(schema: ExamSetEntitySchema): GetExamSetDto {
    return new GetExamSetDto({
      id: schema.getId.toString(),
      title: schema.getTitle,
      version: schema.getVersion,
      totalQuestions: schema.getTotalQuestions,
      createdAt: schema.getCreatedAt,
    });
  }
}

export class GetExamSetDetailDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: Number })
  version: number;

  @ApiProperty({ type: Number })
  totalQuestions: number;

  @ApiProperty({ type: [ExamQuestionDto] })
  questions: ExamQuestionDto[];

  @ApiProperty({ type: Date })
  createdAt: Date;

  constructor(data: Partial<GetExamSetDetailDto>) {
    Object.assign(this, data);
  }

  public static from(schema: ExamSetEntitySchema): GetExamSetDetailDto {
    return new GetExamSetDetailDto({
      id: schema.getId.toString(),
      title: schema.getTitle,
      version: schema.getVersion,
      totalQuestions: schema.getTotalQuestions,
      questions: schema.getQuestions,
      createdAt: schema.getCreatedAt,
    });
  }
}
