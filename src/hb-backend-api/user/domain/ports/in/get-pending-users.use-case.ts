import { UserEntitySchema } from "../../model/user.entity";

export interface GetPendingUsersUseCase {
  invoke(): Promise<UserEntitySchema[]>;
}
