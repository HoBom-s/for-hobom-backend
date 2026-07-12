import { Inject, Injectable } from "@nestjs/common";
import { forkJoin, from, lastValueFrom, map } from "rxjs";
import { GetMyProjectsUseCase } from "../../ports/in/get-my-projects.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { ProjectQueryPort } from "../../ports/out/project-query.port";
import { ProjectDocument } from "../../domain/model/project.schema";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Injectable()
export class GetMyProjectsService implements GetMyProjectsUseCase {
  constructor(
    @Inject(DIToken.ProjectModule.ProjectQueryPort)
    private readonly projectQueryPort: ProjectQueryPort,
  ) {}

  public async invoke(userId: UserId): Promise<ProjectDocument[]> {
    return lastValueFrom(
      forkJoin([
        from(this.projectQueryPort.findByOwner(userId)),
        from(this.projectQueryPort.findByMember(userId)),
      ]).pipe(
        map(([owned, membered]) => {
          const idSet = new Set<string>();
          const result: ProjectDocument[] = [];

          for (const project of [...owned, ...membered]) {
            const id = String(project._id);
            if (!idSet.has(id)) {
              idSet.add(id);
              result.push(project);
            }
          }

          return result;
        }),
      ),
    );
  }
}
