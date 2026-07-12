import { PipeTransform } from "@nestjs/common";
import { NotificationId } from "../../domain/model/notification-id.vo";

export class ParseNotificationIdPipe implements PipeTransform<
  string,
  NotificationId
> {
  transform(value: string): NotificationId {
    return NotificationId.fromString(value);
  }
}
