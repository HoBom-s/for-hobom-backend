import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IssueDocument } from "../../../domain/model/issue.schema";

export class GetIssueDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  project: string;

  @ApiProperty({ type: Number })
  issueNumber: number;

  @ApiProperty({ type: String })
  issueKey: string;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiPropertyOptional({ type: String })
  description: string | null;

  @ApiProperty({ type: String })
  status: string;

  @ApiProperty({ type: String })
  statusCategory: string;

  @ApiProperty({ type: String })
  priority: string;

  @ApiPropertyOptional({ type: String })
  resolution: string | null;

  @ApiProperty({ type: String })
  reporter: string;

  @ApiPropertyOptional({ type: String })
  assignee: string | null;

  @ApiPropertyOptional({ type: String })
  sprint: string | null;

  @ApiPropertyOptional({ type: String })
  parent: string | null;

  @ApiProperty({ type: [String] })
  labels: string[];

  @ApiPropertyOptional({ type: Number })
  storyPoints: number | null;

  @ApiPropertyOptional({ type: Date })
  dueDate: Date | null;

  @ApiPropertyOptional({ type: Date })
  resolvedAt: Date | null;

  constructor(data: Partial<GetIssueDto>) {
    Object.assign(this, data);
  }

  public static from(doc: IssueDocument): GetIssueDto {
    return new GetIssueDto({
      id: String(doc._id),
      project: String(doc.project),
      issueNumber: doc.issueNumber,
      issueKey: doc.issueKey,
      type: doc.type,
      title: doc.title,
      description: doc.description,
      status: doc.status,
      statusCategory: doc.statusCategory,
      priority: doc.priority,
      resolution: doc.resolution,
      reporter: String(doc.reporter),
      assignee: doc.assignee != null ? String(doc.assignee) : null,
      sprint: doc.sprint != null ? String(doc.sprint) : null,
      parent: doc.parent != null ? String(doc.parent) : null,
      labels: doc.labels,
      storyPoints: doc.storyPoints,
      dueDate: doc.dueDate,
      resolvedAt: doc.resolvedAt,
    });
  }
}
