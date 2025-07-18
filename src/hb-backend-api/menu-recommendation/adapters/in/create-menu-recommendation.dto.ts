import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
import { MenuKind } from "../../domain/model/menu-kind.enum";
import { MenuTimeOfMeal } from "../../domain/model/menu-time-of-meal.enum";
import { FoodType } from "../../domain/model/food-type.enum";

export class CreateMenuRecommendationDto {
  @ApiProperty({ type: "string", required: true })
  @IsString({ message: "메뉴 제목을 입력해 주세요." })
  @IsNotEmpty({ message: "메뉴 제목은 필수로 입력해야 해요." })
  @MinLength(1, { message: "메뉴 제목은 최소 1자 이상이어야 해요." })
  name: string;

  @ApiProperty({ enum: MenuKind, required: true })
  @IsNotEmpty({ message: "메뉴 종류는 필수로 입력해야 해요." })
  @IsEnum(MenuKind, {
    message: "며뉴 종류의 타입이 일치하지 않아요.",
  })
  menuKind: MenuKind;

  @ApiProperty({ enum: MenuTimeOfMeal, required: true })
  @IsNotEmpty({ message: "메뉴 식사 시간 구분 값은 필수에요." })
  @IsEnum(MenuTimeOfMeal, {
    message: "메뉴 식사 시간 구분 값의 타입이 일치하지 않아요.",
  })
  timeOfMeal: MenuTimeOfMeal;

  @ApiProperty({ enum: FoodType, required: true })
  @IsNotEmpty({ message: "메뉴 음식의 종류는 필수에요. 입력해 주세요." })
  @IsEnum(FoodType, { message: "메뉴 음식의 종류 값이 일치하지 않아요." })
  foodType: FoodType;
}
