import { PipeTransform } from "@nestjs/common";
import { CategoryId } from "../../../domain/vo/category-id.vo";

export class ParseCategoryIdPipe implements PipeTransform<string, CategoryId> {
  transform(value: string): CategoryId {
    return CategoryId.fromString(value);
  }
}
