import { ProjectLabelId } from "../../domain/model/project-label-id.vo";

export interface UpdateProjectLabelUseCase {
  invoke(id: ProjectLabelId, name: string, color: string): Promise<void>;
}
