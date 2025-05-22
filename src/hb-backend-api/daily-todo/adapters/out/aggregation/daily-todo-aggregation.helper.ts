import { PipelineStage } from "mongoose";

export class DailyTodoAggregationHelper {
  public static buildCategoryJoin(): PipelineStage[] {
    return [
      {
        $addFields: {
          categoryId: "$category.value",
        },
      },
      {
        $lookup: {
          from: "category",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  public static buildUserJoin(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "user",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: {
          path: "$owner",
        },
      },
    ];
  }
}
