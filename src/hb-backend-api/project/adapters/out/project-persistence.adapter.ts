import { Inject, Injectable } from "@nestjs/common";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { MemberRole } from "../../domain/enums/member-role.enum";
import { ProjectId } from "../../domain/model/project-id.vo";
import { CreateProjectEntity } from "../../domain/model/project.entity";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectRepository } from "../../domain/repositories/project.repository";

@Injectable()
export class ProjectPersistenceAdapter implements ProjectPersistencePort {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  public async save(entity: CreateProjectEntity): Promise<void> {
    await this.projectRepository.save(entity);
  }

  public async update(
    id: ProjectId,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.projectRepository.update(id, data);
  }

  public async incrementIssueSequence(id: ProjectId): Promise<number> {
    return this.projectRepository.incrementIssueSequence(id);
  }

  public async addMember(
    id: ProjectId,
    userId: UserId,
    role: MemberRole,
  ): Promise<void> {
    await this.projectRepository.addMember(id, userId, role);
  }

  public async removeMember(id: ProjectId, userId: UserId): Promise<void> {
    await this.projectRepository.removeMember(id, userId);
  }

  public async deleteOne(id: ProjectId): Promise<void> {
    await this.projectRepository.deleteOne(id);
  }
}
