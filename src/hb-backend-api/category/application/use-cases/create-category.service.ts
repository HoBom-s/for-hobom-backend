import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateCategoryUseCase } from "../ports/in/create-category.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { CategoryPersistencePort } from "../ports/out/category-persistence.port";
import { CreateCategoryCommand } from "../command/create-category.command";
import { CategoryCreateEntitySchema } from "../../domain/entity/category.entity";
import { CategoryQueryPort } from "../ports/out/category-query.port";
import { CategoryTitle } from "../../domain/vo/category-title.vo";
import { UserId } from "../../../user/domain/vo/user-id.vo";
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
