import { PipeTransform, Injectable } from "@nestjs/common";
import { IssueId } from "../../domain/model/issue-id.vo";

@Injectable()
export class ParseIssueIdPipe implements PipeTransform<string, IssueId> {
  transform(value: string): IssueId {
    return IssueId.fromString(value);
  }
}
