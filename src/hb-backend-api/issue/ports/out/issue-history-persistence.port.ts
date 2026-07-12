import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { CreateIssueHistoryEntity } from "../../domain/model/issue-history.entity";

export interface IssueHistoryPersistencePort {
  save(entity: CreateIssueHistoryEntity): Promise<void>;
  deleteByProject(projectId: ProjectId): Promise<void>;
}
