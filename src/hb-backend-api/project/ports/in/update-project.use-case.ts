import { ProjectId } from "../../domain/model/project-id.vo";

export interface UpdateProjectUseCase {
  invoke(
    id: ProjectId,
    name: string,
    description: string | null,
  ): Promise<void>;
}
