import { ApiProperty } from "@nestjs/swagger";
import { LabelQueryResult } from "../../domain/ports/out/label-query.result";

export class GetLabelDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  ownerId: string;

  constructor(id: string, title: string, ownerId: string) {
    this.id = id;
    this.title = title;
    this.ownerId = ownerId;
  }

  public static from(result: LabelQueryResult): GetLabelDto {
    return new GetLabelDto(
      result.getId.toString(),
      result.getTitle.raw,
      result.getOwner.toString(),
    );
  }
}
