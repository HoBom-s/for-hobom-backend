import { ProjectId } from "../../domain/model/project-id.vo";

export interface UpdateProjectWorkflowUseCase {
  invoke(
    projectId: ProjectId,
    workflow: {
      statuses: {
        id: string;
        name: string;
        isDone: boolean;
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
