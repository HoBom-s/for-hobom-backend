import { ProjectLabelId } from "../../domain/model/project-label-id.vo";

export interface DeleteProjectLabelUseCase {
  invoke(id: ProjectLabelId): Promise<void>;
}
