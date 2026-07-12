import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IssueCommentDocument } from "../../../domain/model/issue-comment.schema";

export class GetIssueCommentDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  issue: string;

  @ApiProperty({ type: String })
  author: string;

  @ApiProperty({ type: String })
  body: string;

  @ApiPropertyOptional({ type: Date })
  editedAt: Date | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  constructor(data: Partial<GetIssueCommentDto>) {
    Object.assign(this, data);
  }

  public static from(doc: IssueCommentDocument): GetIssueCommentDto {
    return new GetIssueCommentDto({
      id: String(doc._id),
      issue: String(doc.issue),
      author: String(doc.author),
      body: doc.body,
      editedAt: doc.editedAt,
      createdAt: (doc as unknown as { createdAt: Date }).createdAt,
    });
  }
}
