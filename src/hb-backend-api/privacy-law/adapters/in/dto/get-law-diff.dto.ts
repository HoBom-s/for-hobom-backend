import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { LawDiffEntitySchema } from "../../../domain/model/law-diff.entity";

class ArticleChangeDto {
  @ApiProperty({ type: String })
  articleNo: string;

  @ApiProperty({ type: String, enum: ["ADDED", "MODIFIED", "DELETED"] })
  changeType: string;

  @ApiPropertyOptional({ type: String })
  before: string | null;

  @ApiPropertyOptional({ type: String })
  after: string | null;
}

export class GetLawDiffDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  fromVersionId: string;

  @ApiProperty({ type: String })
  toVersionId: string;

  @ApiProperty({ type: String })
  fromProclamationDate: string;

  @ApiProperty({ type: String })
  toProclamationDate: string;

  @ApiProperty({ type: [ArticleChangeDto] })
  changes: ArticleChangeDto[];

  constructor(data: Partial<GetLawDiffDto>) {
    Object.assign(this, data);
  }

  public static from(schema: LawDiffEntitySchema): GetLawDiffDto {
    return new GetLawDiffDto({
      id: schema.getId.toString(),
      fromVersionId: schema.getFromVersionId.toString(),
      toVersionId: schema.getToVersionId.toString(),
      fromProclamationDate: schema.getFromProclamationDate,
      toProclamationDate: schema.getToProclamationDate,
      changes: schema.getChanges.map((c) => ({
        articleNo: c.getArticleNo,
        changeType: c.getChangeType,
        before: c.getBefore,
        after: c.getAfter,
      })),
    });
  }
}
