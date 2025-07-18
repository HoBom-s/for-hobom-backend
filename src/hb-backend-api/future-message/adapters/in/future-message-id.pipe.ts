import { PipeTransform } from "@nestjs/common";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";

export class ParseFutureMessageIdPipe
  implements PipeTransform<string, FutureMessageId>
{
  transform(value: string): FutureMessageId {
    return FutureMessageId.fromString(value);
  }
}
