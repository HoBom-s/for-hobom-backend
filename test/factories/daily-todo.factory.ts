import { DailyTodoWithRelations } from "../../src/hb-backend-api/daily-todo/domain/entity/daily-todo.retations";
import { DailyTodoCompleteStatus } from "../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";

export function createDailyTodo(): DailyTodoWithRelations[] {
  return [
    {
      _id: "682ebdc36db6d5945d202f15",
      title: "TODO",
      date: new Date(),
      owner: {
        id: "681c1ebc9481a8b5148f5155",
        username: "Robin",
        nickname: "Robin Yeon",
      },
      reaction: null,
      progress: DailyTodoCompleteStatus.COMPLETED,
      cycle: DailyTodoCycle.EVERYDAY,
      category: {
        id: "6825f6a155f17284810680ed",
        title: "CATEGORY",
      },
    },
  ];
}
