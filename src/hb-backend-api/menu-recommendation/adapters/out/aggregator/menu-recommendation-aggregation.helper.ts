import { PipelineStage } from "mongoose";

export class MenuRecommendationAggregationHelper {
  public static buildUserJoin(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "user",
          localField: "registerPerson",
          foreignField: "_id",
          as: "registerPerson",
        },
      },
      {
        $unwind: {
          path: "$registerPerson",
        },
      },
    ];
  }

  public static buildProject(): PipelineStage[] {
    return [
      {
        $project: {
          id: "$_id",
          name: 1,
          menuKind: 1,
          timeOfMeal: 1,
          foodType: 1,
          registerPerson: {
            id: "$registerPerson._id",
            username: "$registerPerson.username",
            nickname: "$registerPerson.nickname",
          },
        },
      },
    ];
  }
}
