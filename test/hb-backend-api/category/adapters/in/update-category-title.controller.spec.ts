import { Test, TestingModule } from "@nestjs/testing";
import { UpdateCategoryTitleController } from "../../../../../src/hb-backend-api/category/adapters/in/update-category-title.controller";
import { GetUserByNicknameUseCase } from "../../../../../src/hb-backend-api/user/domain/ports/in/get-user-by-nickname.use-case";
import { PatchCategoryUseCase } from "../../../../../src/hb-backend-api/category/domain/ports/in/patch-category.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { CategoryId } from "../../../../../src/hb-backend-api/category/domain/model/category-id.vo";
import { Types } from "mongoose";

describe("UpdateCategoryTitleController", () => {
  let controller: UpdateCategoryTitleController;
  let getUserByNicknameUseCase: jest.Mocked<GetUserByNicknameUseCase>;
  let patchCategoryUseCase: jest.Mocked<PatchCategoryUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateCategoryTitleController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.CategoryModule.PatchCategoryUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(UpdateCategoryTitleController);
    getUserByNicknameUseCase = module.get(
      DIToken.UserModule.GetUserByNicknameUseCase,
    );
    patchCategoryUseCase = module.get(
      DIToken.CategoryModule.PatchCategoryUseCase,
    );
  });

  it("should look up user by nickname and call patchCategoryUseCase with correct args", async () => {
    const userId = new UserId(new Types.ObjectId());
    const categoryId = new CategoryId(new Types.ObjectId());
    const mockUser = new UserQueryResult(
      userId,
      "testuser",
      "test@email.com",
      "testnick",
      [],
    );
    getUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
    patchCategoryUseCase.invoke.mockResolvedValue(undefined);

    const userInfo = { nickname: "testnick", accessToken: "token" };

    await controller.updateCategory(userInfo, categoryId, {
      title: "new-title",
    });

    expect(getUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
    const passedNickname = getUserByNicknameUseCase.invoke.mock.calls[0][0];
    expect(passedNickname.raw).toBe("testnick");

    expect(patchCategoryUseCase.invoke).toHaveBeenCalledTimes(1);
    const [passedCategoryId, passedCommand] =
      patchCategoryUseCase.invoke.mock.calls[0];
    expect(passedCategoryId).toBe(categoryId);
    expect(passedCommand.getTitle.raw).toBe("new-title");
    expect(passedCommand.getOwner.toString()).toBe(userId.toString());
  });
});
