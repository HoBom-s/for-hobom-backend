import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, map, Observable, switchMap, tap } from "rxjs";
import { UpdateProjectMemberRoleUseCase } from "../../ports/in/update-project-member-role.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { ProjectId } from "../../domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { MemberRole } from "../../domain/enums/member-role.enum";

@Injectable()
export class UpdateProjectMemberRoleService implements UpdateProjectMemberRoleUseCase {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectPersistencePort)
    private readonly projectPersistencePort: ProjectPersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
  ) {}

  public async invoke(
    projectId: ProjectId,
    userId: UserId,
    role: MemberRole,
  ): Promise<void> {
    await lastValueFrom(
      this.verifyUpdatable(projectId, userId).pipe(
        switchMap(() => this.updateRole(projectId, userId, role)),
      ),
    );
  }

  private verifyUpdatable(
    projectId: ProjectId,
    userId: UserId,
  ): Observable<void> {
    return from(this.projectQueryPort.findById(projectId)).pipe(
      tap((project) => {
        if (project.owner.equals(userId.raw)) {
          throw new BadRequestException("Owner의 역할은 변경할 수 없어요.");
        }

        const isMember = project.members.some((m) =>
          m.userId.equals(userId.raw),
        );
        if (!isMember) {
          throw new BadRequestException("해당 사용자는 멤버가 아니에요.");
        }
      }),
      map(() => undefined as void),
    );
  }

  private updateRole(
    projectId: ProjectId,
    userId: UserId,
    role: MemberRole,
  ): Observable<void> {
    return from(
      this.projectPersistencePort.update(projectId, {
        $set: { "members.$[elem].role": role },
        arrayFilters: [{ "elem.userId": userId.raw }],
      } as Record<string, unknown>),
    );
  }
}
