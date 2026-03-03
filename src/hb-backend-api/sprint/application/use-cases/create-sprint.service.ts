import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateSprintUseCase } from "../../ports/in/create-sprint.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { SprintPersistencePort } from "../../ports/out/sprint-persistence.port";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { CreateSprintEntity } from "../../domain/model/sprint.entity";

@Injectable()
export class CreateSprintService implements CreateSprintUseCase {
  constructor(
    @Inject(DIToken.SprintModule.SprintPersistencePort)
    private readonly sprintPersistencePort: SprintPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    projectId: ProjectId,
    name: string,
    goal: string | null,
    startDate: Date,
    endDate: Date,
    createdBy: UserId,
  ): Promise<void> {
    if (startDate >= endDate) {
      throw new BadRequestException("시작일은 종료일보다 이전이어야 해요.");
    }

    await this.sprintPersistencePort.save(
      CreateSprintEntity.of(
        projectId,
        name,
        goal,
        startDate,
        endDate,
        createdBy,
      ),
    );
  }
}
