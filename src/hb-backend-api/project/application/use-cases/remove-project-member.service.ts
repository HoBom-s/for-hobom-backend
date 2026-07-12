import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, map, Observable, switchMap, tap } from "rxjs";
import { RemoveProjectMemberUseCase } from "../../ports/in/remove-project-member.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { ProjectId } from "../../domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Injectable()
export class RemoveProjectMemberService implements RemoveProjectMemberUseCase {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectPersistencePort)
    private readonly projectPersistencePort: ProjectPersistencePort,
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
  ) {}

  public async invoke(projectId: ProjectId, userId: UserId): Promise<void> {
    await lastValueFrom(
      this.verifyRemovable(projectId, userId).pipe(
        switchMap(() => this.removeMember(projectId, userId)),
      ),
    );
  }

  private verifyRemovable(
    projectId: ProjectId,
    userId: UserId,
  ): Observable<void> {
    return from(this.projectQueryPort.findById(projectId)).pipe(
      tap((project) => {
        if (project.owner.equals(userId.raw)) {
          throw new BadRequestException("Owner는 제거할 수 없어요.");
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

  private removeMember(projectId: ProjectId, userId: UserId): Observable<void> {
    return from(this.projectPersistencePort.removeMember(projectId, userId));
  }
}
