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
          path: "$rowner",
        },
      },
    ];
  }

  public static buildProject(): PipelineStage[] {
    return [
      {
        $project: {
          id: "$_id",
          title: 1,
          date: 1,
          reaction: 1,
          progress: 1,
          cycle: 1,
          owner: {
            id: "$owner._id",
            username: "$owner.username",
            nickname: "$owner.nickname",
          },
          category: {
            id: "$category._id",
            title: "$category.title",
          },
        },
      },
    ];
  }
}
