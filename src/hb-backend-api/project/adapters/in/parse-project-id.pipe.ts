import { PipeTransform, Injectable } from "@nestjs/common";
import { ProjectId } from "../../domain/model/project-id.vo";

@Injectable()
export class ParseProjectIdPipe implements PipeTransform<string, ProjectId> {
  transform(value: string): ProjectId {
    return ProjectId.fromString(value);
  }
}
