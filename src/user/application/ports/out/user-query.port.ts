import { UserEntitySchema } from "../../../domain/entity/user.entity";

export interface UserQueryPort {
  findById(id: string): Promise<UserEntitySchema>;
}
