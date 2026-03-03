import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom, map, Observable, switchMap, tap } from "rxjs";
import { AddProjectMemberUseCase } from "../../ports/in/add-project-member.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectPersistencePort } from "../../ports/out/project-persistence.port";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { ProjectId } from "../../domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { MemberRole } from "../../domain/enums/member-role.enum";

@Injectable()
export class AddProjectMemberService implements AddProjectMemberUseCase {
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
      this.verifyNotAlreadyMember(projectId, userId).pipe(
        switchMap(() => this.addMember(projectId, userId, role)),
      ),
    );
  }

  private verifyNotAlreadyMember(
    projectId: ProjectId,
    userId: UserId,
  ): Observable<void> {
    return from(this.projectQueryPort.findById(projectId)).pipe(
      tap((project) => {
        const isMember = project.members.some((m) =>
          m.userId.equals(userId.raw),
        );
        if (isMember) {
          throw new BadRequestException("이미 멤버로 등록된 사용자에요.");
        }
      }),
      map(() => undefined as void),
    );
  }

  private addMember(
    projectId: ProjectId,
    userId: UserId,
    role: MemberRole,
  ): Observable<void> {
    return from(this.projectPersistencePort.addMember(projectId, userId, role));
  }
}
