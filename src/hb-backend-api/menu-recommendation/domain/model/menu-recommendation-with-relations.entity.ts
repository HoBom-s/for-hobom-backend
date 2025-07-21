import { MenuKind } from "./menu-kind.enum";
import { MenuTimeOfMeal } from "./menu-time-of-meal.enum";
import { FoodType } from "./food-type.enum";
import { MenuRecommendationId } from "./menu-recommendation-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export class MenuRecommendationWithRelationsEntity {
  id: string;

  name: string;

  menuKind: MenuKind;

  timeOfMeal: MenuTimeOfMeal;

  foodType: FoodType;

  registerPerson: {
    id: string;
    username: string;
    nickname: string;
  };
}

export class RegisterPerson {
  constructor(
    private readonly id: UserId,
    private readonly username: string,
    private readonly nickname: string,
  ) {
    this.id = id;
    this.username = username;
    this.nickname = nickname;
  }

  public static of(
    id: UserId,
    username: string,
    nickname: string,
  ): RegisterPerson {
    return new RegisterPerson(id, username, nickname);
  }

  public get getId(): UserId {
    return this.id;
  }

  public get getUsername(): string {
    return this.username;
  }

  public get getNickname(): string {
    return this.nickname;
  }
}

export class MenuRecommendationRelationEntity {
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

  public static of(
    id: MenuRecommendationId,
    name: string,
    menuKind: MenuKind,
    timeOfMeal: MenuTimeOfMeal,
    foodType: FoodType,
    registerPerson: RegisterPerson,
  ): MenuRecommendationRelationEntity {
    return new MenuRecommendationRelationEntity(
      id,
      name,
      menuKind,
      timeOfMeal,
      foodType,
      registerPerson,
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
