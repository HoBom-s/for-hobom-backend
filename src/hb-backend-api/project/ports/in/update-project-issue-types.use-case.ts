import { ProjectId } from "../../domain/model/project-id.vo";

export interface UpdateProjectIssueTypesUseCase {
  invoke(
    projectId: ProjectId,
    issueTypes: {
      id: string;
      name: string;
      icon: string;
      isSubtask: boolean;
    }[],
  ): Promise<void>;
}
