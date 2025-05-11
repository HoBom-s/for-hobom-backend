import { Injectable, PipeTransform } from "@nestjs/common";
import { UserId } from "../../../domain/vo/user-id.vo";

@Injectable()
export class ParseUserIdPipe implements PipeTransform<string, UserId> {
  transform(value: string): UserId {
    return UserId.fromString(value);
  }
}
