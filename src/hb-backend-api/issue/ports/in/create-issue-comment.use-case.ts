import { IssueId } from "../../domain/model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface CreateIssueCommentUseCase {
  invoke(
    issueId: IssueId,
    projectId: ProjectId,
    author: UserId,
    body: string,
  ): Promise<void>;
}
