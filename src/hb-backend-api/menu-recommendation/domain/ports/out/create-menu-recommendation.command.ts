import { MenuKind } from "../../model/menu-kind.enum";
import { MenuTimeOfMeal } from "../../model/menu-time-of-meal.enum";
import { FoodType } from "../../model/food-type.enum";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { CreateMenuRecommendationEntity } from "../../model/create-menu-recommendation.entity";

export class CreateMenuRecommendationCommand {
  constructor(
    private readonly name: string,
    private readonly menuKind: MenuKind,
    private readonly timeOfMeal: MenuTimeOfMeal,
    private readonly foodType: FoodType,
    private readonly registerPerson: UserId,
  ) {
    this.name = name;
    this.menuKind = menuKind;
    this.timeOfMeal = timeOfMeal;
    this.foodType = foodType;
    this.registerPerson = registerPerson;
  }

  public static of(
    name: string,
    menuKind: MenuKind,
    timeOfMeal: MenuTimeOfMeal,
    foodType: FoodType,
    registerPerson: UserId,
  ): CreateMenuRecommendationCommand {
    return new CreateMenuRecommendationCommand(
      name,
      menuKind,
      timeOfMeal,
      foodType,
      registerPerson,
    );
  }

  public toEntity(): CreateMenuRecommendationEntity {
    return CreateMenuRecommendationEntity.of(
      this.name,
      this.menuKind,
      this.timeOfMeal,
      this.foodType,
      this.registerPerson,
    );
  }
}
