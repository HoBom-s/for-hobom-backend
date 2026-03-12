import { ApiProperty } from "@nestjs/swagger";

export class AskQuestionResponseDto {
  @ApiProperty({ description: "답변" })
  answer: string;

  @ApiProperty({ description: "참조된 조문 번호 목록", type: [String] })
  referencedArticles: string[];
}
