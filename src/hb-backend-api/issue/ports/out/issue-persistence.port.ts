import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { CreateIssueEntity } from "../../domain/model/issue.entity";
import { IssueId } from "../../domain/model/issue-id.vo";

export interface IssuePersistencePort {
  save(entity: CreateIssueEntity): Promise<void>;
  update(id: IssueId, data: Record<string, unknown>): Promise<void>;
  deleteOne(id: IssueId): Promise<void>;
  deleteByProject(projectId: ProjectId): Promise<void>;
}
