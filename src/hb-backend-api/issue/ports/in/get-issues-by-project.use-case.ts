import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { IssueDocument } from "../../domain/model/issue.schema";

export interface GetIssuesByProjectUseCase {
  invoke(projectId: ProjectId): Promise<IssueDocument[]>;
}
