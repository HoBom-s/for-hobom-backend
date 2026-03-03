import { PipeTransform, Injectable } from "@nestjs/common";
import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";

@Injectable()
export class ParseIssueCommentIdPipe
  implements PipeTransform<string, IssueCommentId>
{
  transform(value: string): IssueCommentId {
    return IssueCommentId.fromString(value);
  }
}
