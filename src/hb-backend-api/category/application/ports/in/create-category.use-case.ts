import { CreateCategoryCommand } from "../../command/create-category.command";

export interface CreateCategoryUseCase {
  invoke(command: CreateCategoryCommand): Promise<void>;
}
