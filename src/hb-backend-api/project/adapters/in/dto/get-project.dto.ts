import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProjectDocument } from "../../../domain/model/project.schema";

export class GetProjectDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  key: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({ type: String })
  description: string | null;

  @ApiProperty({ type: String })
  owner: string;

  @ApiProperty()
  members: { userId: string; role: string; joinedAt: Date }[];

  @ApiProperty({ type: Number })
  issueSequence: number;

  constructor(data: Partial<GetProjectDto>) {
    Object.assign(this, data);
  }

  public static from(doc: ProjectDocument): GetProjectDto {
    return new GetProjectDto({
      id: String(doc._id),
      key: doc.key,
      name: doc.name,
      description: doc.description,
      owner: String(doc.owner),
      members: doc.members.map((m) => ({
        userId: String(m.userId),
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      issueSequence: doc.issueSequence,
    });
  }
}
