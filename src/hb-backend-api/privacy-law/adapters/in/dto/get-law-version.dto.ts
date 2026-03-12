import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { LawVersionEntitySchema } from "../../../domain/model/law-version.entity";

class ParagraphSubItemDto {
  @ApiProperty({ type: String })
  no: string;

  @ApiProperty({ type: String })
  content: string;
}

class ParagraphDto {
  @ApiProperty({ type: String })
  no: string;

  @ApiProperty({ type: String })
  content: string;

  @ApiProperty({ type: [ParagraphSubItemDto] })
  subItems: ParagraphSubItemDto[];
}

class LawArticleDto {
  @ApiProperty({ type: String })
  articleNo: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  content: string;

  @ApiProperty({ type: [ParagraphDto] })
  paragraphs: ParagraphDto[];
}

export class GetLawVersionDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  lawId: string;

  @ApiProperty({ type: String })
  lawName: string;

  @ApiProperty({ type: String })
  proclamationDate: string;

  @ApiProperty({ type: String })
  enforcementDate: string;

  @ApiProperty({ type: [LawArticleDto] })
  articles: LawArticleDto[];

  @ApiPropertyOptional({ type: String })
  rawXml: string | null;

  @ApiProperty({ type: Date })
  fetchedAt: Date;

  constructor(data: Partial<GetLawVersionDto>) {
    Object.assign(this, data);
  }

  public static from(schema: LawVersionEntitySchema): GetLawVersionDto {
    return new GetLawVersionDto({
      id: schema.getId.toString(),
      lawId: schema.getLawId,
      lawName: schema.getLawName,
      proclamationDate: schema.getProclamationDate,
      enforcementDate: schema.getEnforcementDate,
      articles: schema.getArticles.map((a) => ({
        articleNo: a.getArticleNo,
        title: a.getTitle,
        content: a.getContent,
        paragraphs: a.getParagraphs,
      })),
      rawXml: schema.getRawXml,
      fetchedAt: schema.getFetchedAt,
    });
  }
}
