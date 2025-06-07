import { TodayMenuId } from "../../domain/vo/today-menu.vo";

export class PickTodayMenuCommand {
  constructor(private readonly id: TodayMenuId) {
    this.id = id;
  }

  public static of(id: TodayMenuId): PickTodayMenuCommand {
    return new PickTodayMenuCommand(id);
  }

  public get getId(): TodayMenuId {
    return this.id;
  }
}
