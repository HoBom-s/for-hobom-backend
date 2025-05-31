import { DailyTodoRepository } from "../../src/hb-backend-api/daily-todo/domain/repositories/daily-todo.repository";

export function createDailyTodoRepository(): jest.Mocked<DailyTodoRepository> {
  return {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByDate: jest.fn(),
    updateDailyTodoCompleteStatus: jest.fn(),
    updateDailyTodoCycle: jest.fn(),
    updateDailyTodoReaction: jest.fn(),
  };
}
