import { MenuKind } from "../../domain/model/menu-kind.enum";
import { MenuTimeOfMeal } from "../../domain/model/menu-time-of-meal.enum";
import { FoodType } from "../../domain/model/food-type.enum";
import { ApiProperty } from "@nestjs/swagger";
import { GetMenuRecommendationQueryResult } from "../../domain/ports/out/get-menu-recommendation-query.result";

interface PersonType {
  id: string;
  username: string;
  nickname: string;
}

class Person {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  nickname: string;
}

export class GetMenuRecommendationDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ enum: MenuKind })
  menuKind: MenuKind;

  @ApiProperty({ enum: MenuTimeOfMeal })
  timeOfMeal: MenuTimeOfMeal;

  @ApiProperty({ enum: FoodType })
  foodType: FoodType;

  @ApiProperty({ type: Person })
  registerPerson: PersonType;

  constructor(
    id: string,
    name: string,
    menuKind: MenuKind,
    timeOfMeal: MenuTimeOfMeal,
    foodType: FoodType,
    registerPerson: PersonType,
  ) {
    this.id = id;
    this.name = name;
    this.menuKind = menuKind;
    this.timeOfMeal = timeOfMeal;
    this.foodType = foodType;
    this.registerPerson = registerPerson;
  }

  public static from(
    queryResult: GetMenuRecommendationQueryResult,
  ): GetMenuRecommendationDto {
    const person: PersonType = {
      id: queryResult.getRegisterPerson.getId.toString(),
      username: queryResult.getRegisterPerson.getUsername,
      nickname: queryResult.getRegisterPerson.getNickname,
    };
    return new GetMenuRecommendationDto(
      queryResult.getId.toString(),
      queryResult.getName,
      queryResult.getMenuKind,
      queryResult.getTimeOfMeal,
      queryResult.getFoodType,
      person,
    );
  }
}
