import { CategoryQueryResult } from "../../../application/result/category-query.result";
import { ApiProperty } from "@nestjs/swagger";

export class GetCategoryDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  ownerId: string;

  @ApiProperty({ type: [String] })
  dailyTodos: string[];

  constructor(
    id: string,
    title: string,
    ownerId: string,
    dailyTodos: string[],
  ) {
    this.id = id;
    this.title = title;
    this.ownerId = ownerId;
    this.dailyTodos = dailyTodos;
  }

  public static from(categoryQueryResult: CategoryQueryResult): GetCategoryDto {
    return new GetCategoryDto(
      categoryQueryResult.getId.toString(),
      categoryQueryResult.getTitle.raw,
      categoryQueryResult.getOwner.toString(),
      categoryQueryResult.getDailyTodos.map((item) => item.toString()),
    );
  }
}
