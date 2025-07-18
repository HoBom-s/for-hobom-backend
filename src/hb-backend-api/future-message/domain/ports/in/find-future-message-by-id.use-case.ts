import { FutureMessageId } from "../../model/future-message-id.vo";
import { FutureMessageQueryResult } from "../out/future-message-query.result";

export interface FindFutureMessageByIdUseCase {
  invoke(id: FutureMessageId): Promise<FutureMessageQueryResult>;
}
