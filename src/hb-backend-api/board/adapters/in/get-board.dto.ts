import { ApiProperty } from "@nestjs/swagger";
import { BoardDocument } from "../../domain/model/board.schema";

export class GetBoardDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  project: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty()
  columns: {
    statusId: string;
    name: string;
    wipLimit: number | null;
    order: number;
  }[];

  @ApiProperty({ type: String })
  createdBy: string;

  constructor(
    id: string,
    project: string,
    name: string,
    type: string,
    columns: {
      statusId: string;
      name: string;
      wipLimit: number | null;
      order: number;
    }[],
    createdBy: string,
  ) {
    this.id = id;
    this.project = project;
    this.name = name;
    this.type = type;
    this.columns = columns;
    this.createdBy = createdBy;
  }

  public static from(doc: BoardDocument): GetBoardDto {
    return new GetBoardDto(
      String(doc._id),
      String(doc.project),
      doc.name,
      doc.type,
      doc.columns,
      String(doc.createdBy),
    );
  }
}
