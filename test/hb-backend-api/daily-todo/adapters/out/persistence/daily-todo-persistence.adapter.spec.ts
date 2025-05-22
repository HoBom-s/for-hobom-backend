import { Types } from "mongoose";
import { DailyTodoRepository } from "../../../../../../src/hb-backend-api/daily-todo/domain/repositories/daily-todo.repository";
import { DailyTodoPersistenceAdapter } from "../../../../../../src/hb-backend-api/daily-todo/adapters/out/persistence/daily-todo-persistence.adapter";
import { createDailyTodoRepository } from "../../../../../mocks/daily-todo.repository.mock";
import { DailyTodoCreateEntitySchema } from "../../../../../../src/hb-backend-api/daily-todo/domain/entity/daily-todo.entity";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/vo/user-id.vo";
import { DailyTodoCompleteStatus } from "../../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../../../../../src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";

describe("DailyTodoPersistenceAdapter", () => {
  let dailyTodoRepository: jest.Mocked<DailyTodoRepository>;
  let dailyTodoPersistenceAdapter: DailyTodoPersistenceAdapter;

  beforeEach(() => {
    dailyTodoRepository = createDailyTodoRepository();
    dailyTodoPersistenceAdapter = new DailyTodoPersistenceAdapter(
      dailyTodoRepository,
    );
  });

  describe("save()", () => {
    it("should call dailyTodoRepository.save with the given dailyTodo", async () => {
      const userId = new UserId(new Types.ObjectId());
      const dailyTodo = DailyTodoCreateEntitySchema.of(
        "todo",
        new Date(),
        userId,
        null,
        DailyTodoCompleteStatus.PROGRESS,
        DailyTodoCycle.EVERYDAY,
        null,
      );

      await dailyTodoPersistenceAdapter.save(dailyTodo);

      expect(dailyTodoRepository.save).toHaveBeenCalledTimes(1);
      expect(dailyTodoRepository.save).toHaveBeenCalledWith(dailyTodo);
    });
  });
});
