import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface CreateProjectLabelUseCase {
  invoke(projectId: ProjectId, name: string, color: string): Promise<void>;
}
