import { ProjectId } from "../../domain/model/project-id.vo";

export interface DeleteProjectUseCase {
  invoke(id: ProjectId): Promise<void>;
}
