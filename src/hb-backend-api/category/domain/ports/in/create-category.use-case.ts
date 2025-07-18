import { CreateCategoryCommand } from "../out/create-category.command";

export interface CreateCategoryUseCase {
  invoke(command: CreateCategoryCommand): Promise<void>;
}
