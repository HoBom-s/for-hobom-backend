import { UserCreateEntitySchema } from "../../../domain/entity/user.entity";

export interface UserPersistencePort {
  save(user: UserCreateEntitySchema): Promise<void>;
}
