import { MenuKind } from "./menu-kind.enum";
import { MenuTimeOfMeal } from "./menu-time-of-meal.enum";
import { FoodType } from "./food-type.enum";
import { UserId } from "../../../user/domain/model/user-id.vo";

export class CreateMenuRecommendationEntity {
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
  ): CreateMenuRecommendationEntity {
    return new CreateMenuRecommendationEntity(
      name,
      menuKind,
      timeOfMeal,
      foodType,
      registerPerson,
    );
  }

  public get getName(): string {
    return this.name;
  }

  public get getMenuKind(): MenuKind {
    return this.menuKind;
  }

  public get getTimeOfMeal(): MenuTimeOfMeal {
    return this.timeOfMeal;
  }

  public get getFoodType(): FoodType {
    return this.foodType;
  }

  public get getRegisterPerson(): UserId {
    return this.registerPerson;
  }
}
