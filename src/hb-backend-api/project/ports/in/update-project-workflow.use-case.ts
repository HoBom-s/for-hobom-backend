import { ProjectId } from "../../domain/model/project-id.vo";
import { StatusCategory } from "../../domain/enums/status-category.enum";

export interface UpdateProjectWorkflowUseCase {
  invoke(
    projectId: ProjectId,
    workflow: {
      statuses: {
        id: string;
        name: string;
        category: StatusCategory;
        order: number;
      }[];
      transitions: {
        from: string;
        to: string;
        name: string;
      }[];
    },
  ): Promise<void>;
}
