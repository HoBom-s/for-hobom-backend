import { Inject, Injectable } from "@nestjs/common";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectRepository } from "../../domain/repositories/project.repository";
import { ProjectDocument } from "../../domain/model/project.schema";
import { ProjectId } from "../../domain/model/project-id.vo";
import { ProjectKey } from "../../domain/model/project-key.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Injectable()
export class ProjectQueryAdapter implements ProjectQueryPort {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  public async findById(id: ProjectId): Promise<ProjectDocument> {
    return this.projectRepository.findById(id);
  }

  public async findByKey(key: ProjectKey): Promise<ProjectDocument | null> {
    return this.projectRepository.findByKey(key);
  }

  public async findByOwner(owner: UserId): Promise<ProjectDocument[]> {
    return this.projectRepository.findByOwner(owner);
  }

  public async findByMember(userId: UserId): Promise<ProjectDocument[]> {
    return this.projectRepository.findByMember(userId);
  }
}
