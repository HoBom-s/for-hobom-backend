import { CategoryQueryResult } from "../../../application/result/category-query.result";

export class GetCategoryDto {
  constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly ownerId: string,
    private readonly dailyTodos: string[],
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
