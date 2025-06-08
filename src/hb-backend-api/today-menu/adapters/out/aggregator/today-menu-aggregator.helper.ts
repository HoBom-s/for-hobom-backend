import { PipelineStage } from "mongoose";

export class TodayMenuAggregator {
  public static buildRecommendedMenu(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "menu-recommendation",
          localField: "recommendedMenu",
          foreignField: "_id",
          as: "recommendedMenu",
        },
      },
      {
        $unwind: {
          path: "$recommendedMenu",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  public static buildRecommendedMenuUser(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "user",
          localField: "recommendedMenu.registerPerson",
          foreignField: "_id",
          as: "recommendedMenu.registerPerson",
        },
      },
      {
        $unwind: {
          path: "$recommendedMenu.registerPerson",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  public static buildCandidates(): PipelineStage[] {
    return [
      {
        $addFields: {
          candidateIds: {
            $map: {
              input: "$candidates",
              as: "c",
              in: "$$c.value",
            },
          },
        },
      },
      {
        $lookup: {
          from: "menu-recommendation",
          let: {
            ids: "$candidateIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$ids"],
                },
              },
            },
          ],
          as: "candidates",
        },
      },
      {
        $project: {
          candidateIds: 0,
        },
      },
    ];
  }

  public static buildCandidateUsers(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: "user",
          let: { registerIds: "$candidates.registerPerson" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$registerIds"],
                },
              },
            },
          ],
          as: "candidatePersons",
        },
      },
      {
        $addFields: {
          candidates: {
            $map: {
              input: "$candidates",
              as: "c",
              in: {
                $mergeObjects: [
                  "$$c",
                  {
                    registerPerson: {
                      $first: {
                        $filter: {
                          input: "$candidatePersons",
                          as: "p",
                          cond: {
                            $eq: ["$$p._id", "$$c.registerPerson"],
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          candidatePersons: 0,
        },
      },
    ];
  }

  public static buildProject(): PipelineStage[] {
    return [
      {
        $project: {
          id: "$_id",
          recommendationDate: 1,
          recommendedMenu: {
            id: "$recommendedMenu._id",
            name: "$recommendedMenu.name",
            menuKind: "$recommendedMenu.menuKind",
            timeOfMeal: "$recommendedMenu.timeOfMeal",
            foodType: "$recommendedMenu.foodType",
            registerPerson: {
              id: "$recommendedMenu.registerPerson._id",
              username: "$recommendedMenu.registerPerson.username",
              nickname: "$recommendedMenu.registerPerson.nickname",
            },
          },
          candidates: {
            $map: {
              input: "$candidates",
              as: "c",
              in: {
                id: "$$c._id",
                name: "$$c.name",
                menuKind: "$$c.menuKind",
                timeOfMeal: "$$c.timeOfMeal",
                foodType: "$$c.foodType",
                registerPerson: {
                  id: "$$c.registerPerson._id",
                  username: "$$c.registerPerson.username",
                  nickname: "$$c.registerPerson.nickname",
                },
              },
            },
          },
        },
      },
    ];
  }

  public static buildPipeline(): PipelineStage[] {
    return [
      ...this.buildRecommendedMenu(),
      ...this.buildRecommendedMenuUser(),
      ...this.buildCandidates(),
      ...this.buildCandidateUsers(),
      ...this.buildProject(),
    ];
  }
}
