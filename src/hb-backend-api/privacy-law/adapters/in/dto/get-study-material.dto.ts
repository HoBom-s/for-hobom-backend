import { ApiProperty } from "@nestjs/swagger";
import { StudyMaterialEntitySchema } from "../../../domain/model/study-material.entity";

class QuizDto {
  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  question: string;

  @ApiProperty({ type: String })
  answer: string;

  @ApiProperty({ type: String })
  explanation: string;

  @ApiProperty({ type: [String] })
  choices: string[];
}

export class GetStudyMaterialDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  diffId: string;

  @ApiProperty({ type: String })
  summary: string;

  @ApiProperty({ type: [String] })
  keyPoints: string[];

  @ApiProperty({ type: [QuizDto] })
  quizzes: QuizDto[];

  constructor(data: Partial<GetStudyMaterialDto>) {
    Object.assign(this, data);
  }

  public static from(schema: StudyMaterialEntitySchema): GetStudyMaterialDto {
    return new GetStudyMaterialDto({
      id: schema.getId.toString(),
      diffId: schema.getDiffId.toString(),
      summary: schema.getSummary,
      keyPoints: schema.getKeyPoints,
      quizzes: schema.getQuizzes,
    });
  }
}
