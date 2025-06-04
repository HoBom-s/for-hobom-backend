import { DailyTodoRepository } from "../../src/hb-backend-api/daily-todo/domain/repositories/daily-todo.repository";
import { DailyTodoId } from "../../src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { UserId } from "../../src/hb-backend-api/user/domain/vo/user-id.vo";

export function createDailyTodoRepository(): jest.Mocked<DailyTodoRepository> {
  return {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByDate: jest.fn(),
    updateDailyTodoCompleteStatus: jest.fn(),
    updateDailyTodoCycle: jest.fn(),
    updateDailyTodoReaction: jest.fn(),
    deleteDailyTodoById: jest.fn(),
  };
}
