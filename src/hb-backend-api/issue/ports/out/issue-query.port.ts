import { IssueDocument } from "../../domain/model/issue.schema";
import { IssueId } from "../../domain/model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { SprintId } from "../../../sprint/domain/model/sprint-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface IssueQueryPort {
  findById(id: IssueId): Promise<IssueDocument>;
  findByIssueKey(
    projectId: ProjectId,
    issueNumber: number,
  ): Promise<IssueDocument | null>;
  findByProject(projectId: ProjectId): Promise<IssueDocument[]>;
  findBySprint(sprintId: SprintId): Promise<IssueDocument[]>;
  findByAssignee(userId: UserId): Promise<IssueDocument[]>;
  findByParent(parentId: IssueId): Promise<IssueDocument[]>;
}
