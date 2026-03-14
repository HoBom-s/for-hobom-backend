import { Test, TestingModule } from "@nestjs/testing";
import { AdminUserController } from "../../../../../src/hb-backend-api/user/adapters/in/admin-user.controller";
import { ApproveUserUseCase } from "../../../../../src/hb-backend-api/user/domain/ports/in/approve-user.use-case";
import { RejectUserUseCase } from "../../../../../src/hb-backend-api/user/domain/ports/in/reject-user.use-case";
import { GetPendingUsersUseCase } from "../../../../../src/hb-backend-api/user/domain/ports/in/get-pending-users.use-case";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { UserEntitySchema } from "../../../../../src/hb-backend-api/user/domain/model/user.entity";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { Types } from "mongoose";
import { JwtAuthGuard } from "../../../../../src/shared/adapters/in/rest/guard/jwt-auth.guard";
import { AdminGuard } from "../../../../../src/shared/adapters/in/rest/guard/admin.guard";

describe("AdminUserController", () => {
  let controller: AdminUserController;
  let approveUserUseCase: jest.Mocked<ApproveUserUseCase>;
  let rejectUserUseCase: jest.Mocked<RejectUserUseCase>;
  let getPendingUsersUseCase: jest.Mocked<GetPendingUsersUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserController],
      providers: [
        {
          provide: DIToken.UserModule.ApproveUserUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.UserModule.RejectUserUseCase,
          useValue: { invoke: jest.fn() },
        },
        {
          provide: DIToken.UserModule.GetPendingUsersUseCase,
          useValue: { invoke: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AdminUserController);
    approveUserUseCase = module.get(DIToken.UserModule.ApproveUserUseCase);
    rejectUserUseCase = module.get(DIToken.UserModule.RejectUserUseCase);
    getPendingUsersUseCase = module.get(
      DIToken.UserModule.GetPendingUsersUseCase,
    );
  });

  describe("getPendingUsers", () => {
    it("should return mapped GetPendingUserDto array", async () => {
      const userId = new UserId(new Types.ObjectId());
      const mockUser = UserEntitySchema.of(
        userId,
        "testuser",
        "test@email.com",
        "testnick",
        "hashedpw",
      );
      getPendingUsersUseCase.invoke.mockResolvedValue([mockUser]);

      const result = await controller.getPendingUsers();

      expect(getPendingUsersUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(userId.raw.toHexString());
      expect(result[0].username).toBe("testuser");
      expect(result[0].nickname).toBe("testnick");
      expect(result[0].email).toBe("test@email.com");
    });

    it("should return empty array when no pending users", async () => {
      getPendingUsersUseCase.invoke.mockResolvedValue([]);

      const result = await controller.getPendingUsers();

      expect(result).toEqual([]);
    });
  });

  describe("approveUser", () => {
    it("should call approveUserUseCase with correct UserId", async () => {
      const objectId = new Types.ObjectId();
      approveUserUseCase.invoke.mockResolvedValue(undefined);

      await controller.approveUser(objectId.toHexString());

      expect(approveUserUseCase.invoke).toHaveBeenCalledTimes(1);
      const passedId = approveUserUseCase.invoke.mock.calls[0][0];
      expect(passedId.toString()).toBe(objectId.toHexString());
    });
  });

  describe("rejectUser", () => {
    it("should call rejectUserUseCase with correct UserId", async () => {
      const objectId = new Types.ObjectId();
      rejectUserUseCase.invoke.mockResolvedValue(undefined);

      await controller.rejectUser(objectId.toHexString());

      expect(rejectUserUseCase.invoke).toHaveBeenCalledTimes(1);
      const passedId = rejectUserUseCase.invoke.mock.calls[0][0];
      expect(passedId.toString()).toBe(objectId.toHexString());
    });
  });
});
