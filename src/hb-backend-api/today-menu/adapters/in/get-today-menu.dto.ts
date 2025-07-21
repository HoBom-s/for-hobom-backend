import { ApiProperty } from "@nestjs/swagger";
import { MenuTimeOfMeal } from "../../../menu-recommendation/domain/model/menu-time-of-meal.enum";
import { FoodType } from "../../../menu-recommendation/domain/model/food-type.enum";
import {
  GetTodayMenuQueryResult,
  MenuItem,
  RegisterPerson,
} from "../../domain/ports/out/get-today-menu-query.result";

class RegisterPersonDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  nickname: string;

  public static from(person: RegisterPerson): RegisterPersonDto {
    const dto = new RegisterPersonDto();
    dto.id = person.getId.toString();
    dto.username = person.getUsername;
    dto.nickname = person.getNickname;
    return dto;
  }
}

class MenuItemDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ enum: MenuTimeOfMeal })
  timeOfMeal: MenuTimeOfMeal;

  @ApiProperty({ enum: FoodType })
  foodType: FoodType;

  @ApiProperty({ type: RegisterPersonDto })
  registerPerson: RegisterPersonDto;

  public static from(menuItem: MenuItem): MenuItemDto {
    const dto = new MenuItemDto();
    dto.id = menuItem["id"].toString();
    dto.name = menuItem["name"];
    dto.timeOfMeal = menuItem["timeOfMeal"];
    dto.foodType = menuItem["foodType"];
    dto.registerPerson = RegisterPersonDto.from(menuItem["registerPerson"]);
    return dto;
  }
}

export class GetTodayMenuDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: MenuItemDto })
  recommendedMenu: MenuItemDto;

  @ApiProperty({ type: [MenuItemDto] })
  candidates: MenuItemDto[];

  @ApiProperty({ type: String })
  recommendationDate: string;

  public static from(queryResult: GetTodayMenuQueryResult): GetTodayMenuDto {
    const dto = new GetTodayMenuDto();
    dto.id = queryResult.getId.toString();
    dto.recommendationDate = queryResult.getRecommendationDate.value;
    dto.recommendedMenu = MenuItemDto.from(queryResult.getRecommendedMenu);
    dto.candidates = queryResult.getCandidates.map(MenuItemDto.from);
    return dto;
  }
}
