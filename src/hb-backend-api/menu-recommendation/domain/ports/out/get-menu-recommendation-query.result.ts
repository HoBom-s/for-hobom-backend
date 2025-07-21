import { MenuRecommendationId } from "../../model/menu-recommendation-id.vo";
import { MenuKind } from "../../model/menu-kind.enum";
import { MenuTimeOfMeal } from "../../model/menu-time-of-meal.enum";
import { FoodType } from "../../model/food-type.enum";
import {
  MenuRecommendationRelationEntity,
  RegisterPerson,
} from "../../model/menu-recommendation-with-relations.entity";

export class GetMenuRecommendationQueryResult {
  constructor(
    private readonly id: MenuRecommendationId,
    private readonly name: string,
    private readonly menuKind: MenuKind,
    private readonly timeOfMeal: MenuTimeOfMeal,
    private readonly foodType: FoodType,
    private readonly registerPerson: RegisterPerson,
  ) {
    this.id = id;
    this.name = name;
    this.menuKind = menuKind;
    this.timeOfMeal = timeOfMeal;
    this.foodType = foodType;
    this.registerPerson = registerPerson;
  }

  public static from(
    entity: MenuRecommendationRelationEntity,
  ): GetMenuRecommendationQueryResult {
    return new GetMenuRecommendationQueryResult(
      entity.getId,
      entity.getName,
      entity.getMenuKind,
      entity.getTimeOfMeal,
      entity.getFoodType,
      entity.getRegisterPerson,
    );
  }

  public get getId(): MenuRecommendationId {
    return this.id;
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

  public get getRegisterPerson(): RegisterPerson {
    return this.registerPerson;
  }
}
