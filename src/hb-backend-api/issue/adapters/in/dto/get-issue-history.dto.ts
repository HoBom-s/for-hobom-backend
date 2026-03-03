import { ApiProperty } from "@nestjs/swagger";
import { IssueHistoryDocument } from "../../../domain/model/issue-history.schema";

export class GetIssueHistoryDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  issue: string;

  @ApiProperty({ type: String })
  actor: string;

  @ApiProperty({ type: String })
  action: string;

  @ApiProperty()
  changes: { field: string; from: string | null; to: string | null }[];

  @ApiProperty({ type: Date })
  createdAt: Date;

  constructor(data: Partial<GetIssueHistoryDto>) {
    Object.assign(this, data);
  }

  public static from(doc: IssueHistoryDocument): GetIssueHistoryDto {
    return new GetIssueHistoryDto({
      id: String(doc._id),
      issue: String(doc.issue),
      actor: String(doc.actor),
      action: doc.action,
      changes: doc.changes,
      createdAt: (doc as unknown as { createdAt: Date }).createdAt,
    });
  }
}
