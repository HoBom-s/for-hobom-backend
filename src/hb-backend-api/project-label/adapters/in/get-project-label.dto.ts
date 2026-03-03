import { ApiProperty } from "@nestjs/swagger";
import { ProjectLabelDocument } from "../../domain/model/project-label.schema";

export class GetProjectLabelDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() color: string;

  public static from(doc: ProjectLabelDocument): GetProjectLabelDto {
    const dto = new GetProjectLabelDto();
    dto.id = String(doc._id);
    dto.name = doc.name;
    dto.color = doc.color;
    return dto;
  }
}
