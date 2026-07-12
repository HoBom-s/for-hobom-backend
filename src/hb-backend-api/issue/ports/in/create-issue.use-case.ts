import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { IssueType } from "../../domain/enums/issue-type.enum";
import { IssuePriority } from "../../domain/enums/issue-priority.enum";
import { Types } from "mongoose";

export interface CreateIssueUseCase {
  invoke(
    projectId: ProjectId,
    type: IssueType,
    title: string,
    description: string | null,
    priority: IssuePriority,
    reporter: UserId,
    assignee: UserId | null,
    sprint: Types.ObjectId | null,
    parent: Types.ObjectId | null,
    labels: string[],
  ): Promise<void>;
}
