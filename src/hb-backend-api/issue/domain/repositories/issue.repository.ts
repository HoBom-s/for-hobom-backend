import { CreateIssueEntity } from "../model/issue.entity";
import { IssueDocument } from "../model/issue.schema";
import { IssueId } from "../model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { SprintId } from "../../../sprint/domain/model/sprint-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface IssueRepository {
  save(entity: CreateIssueEntity): Promise<void>;
  findById(id: IssueId): Promise<IssueDocument>;
  findByIssueKey(
    projectId: ProjectId,
    issueNumber: number,
  ): Promise<IssueDocument | null>;
  findByProject(projectId: ProjectId): Promise<IssueDocument[]>;
  findBySprint(sprintId: SprintId): Promise<IssueDocument[]>;
  findByAssignee(userId: UserId): Promise<IssueDocument[]>;
  findByParent(parentId: IssueId): Promise<IssueDocument[]>;
  update(id: IssueId, data: Record<string, unknown>): Promise<void>;
  deleteOne(id: IssueId): Promise<void>;
}
