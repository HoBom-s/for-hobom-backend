import { PipeTransform, Injectable } from "@nestjs/common";
import { ProjectLabelId } from "../../domain/model/project-label-id.vo";

@Injectable()
export class ParseProjectLabelIdPipe implements PipeTransform<
  string,
  ProjectLabelId
> {
  transform(value: string): ProjectLabelId {
    return ProjectLabelId.fromString(value);
  }
}
