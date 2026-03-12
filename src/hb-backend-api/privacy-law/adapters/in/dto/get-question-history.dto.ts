import { ApiProperty } from "@nestjs/swagger";
import { QuestionHistoryEntitySchema } from "../../../domain/model/question-history.entity";

export class GetQuestionHistoryDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  question: string;

  @ApiProperty({ type: String })
  answer: string;

  @ApiProperty({ type: [String] })
  referencedArticles: string[];

  @ApiProperty({ type: Date })
  createdAt: Date;

  constructor(data: Partial<GetQuestionHistoryDto>) {
    Object.assign(this, data);
  }

  public static from(
    schema: QuestionHistoryEntitySchema,
  ): GetQuestionHistoryDto {
    return new GetQuestionHistoryDto({
      id: schema.getId.toString(),
      question: schema.getQuestion,
      answer: schema.getAnswer,
      referencedArticles: schema.getReferencedArticles,
      createdAt: schema.getCreatedAt,
    });
  }
}
