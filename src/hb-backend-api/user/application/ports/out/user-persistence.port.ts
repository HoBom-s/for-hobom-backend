import { UserEntitySchema } from "../../../domain/entity/user.entity";

export interface UserPersistencePort {
  save(user: UserEntitySchema): Promise<void>;
}
