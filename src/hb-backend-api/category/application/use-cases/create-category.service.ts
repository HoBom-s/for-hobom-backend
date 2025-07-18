import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateCategoryUseCase } from "../../domain/ports/in/create-category.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { CategoryPersistencePort } from "../../domain/ports/out/category-persistence.port";
import { CreateCategoryCommand } from "../../domain/ports/out/create-category.command";
import { CategoryCreateEntitySchema } from "../../domain/model/category.entity";
import { CategoryQueryPort } from "../../domain/ports/out/category-query.port";
import { CategoryTitle } from "../../domain/model/category-title.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class CreateCategoryService implements CreateCategoryUseCase {
  constructor(
    @Inject(DIToken.CategoryModule.CategoryPersistencePort)
    private readonly categoryPersistencePort: CategoryPersistencePort,
    @Inject(DIToken.CategoryModule.CategoryQueryPort)
    private readonly categoryQueryPort: CategoryQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(command: CreateCategoryCommand): Promise<void> {
    await this.checkAlreadyExistCategoryByTitle(
      command.getTitle,
      command.getOwner,
    );
    await this.saveCategory(command);
  }

  private async checkAlreadyExistCategoryByTitle(
    title: CategoryTitle,
    owner: UserId,
  ) {
    const category = await this.categoryQueryPort.findByTitle(title, owner);
    if (category != null) {
      throw new BadRequestException(`이미 존재하는 카테고리에요. ${title.raw}`);
    }
  }

  private async saveCategory(command: CreateCategoryCommand) {
    await this.categoryPersistencePort.save(
      CategoryCreateEntitySchema.of(command.getTitle, command.getOwner),
    );
  }
}
