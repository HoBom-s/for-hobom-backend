import { ProjectId } from "../../domain/model/project-id.vo";

export interface UpdateProjectPrioritiesUseCase {
  invoke(
    projectId: ProjectId,
    priorities: {
      id: string;
      name: string;
      icon: string;
      order: number;
    }[],
  ): Promise<void>;
}
