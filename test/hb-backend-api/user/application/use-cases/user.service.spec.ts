import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";
import { GetUserService } from "../../../../../src/hb-backend-api/user/application/use-cases/get-user.service";
import { GetUserByNicknameService } from "../../../../../src/hb-backend-api/user/application/use-cases/get-user-by-nickname.service";
import { GetAllUserService } from "../../../../../src/hb-backend-api/user/application/use-cases/get-all-user.service";
import { ApproveUserService } from "../../../../../src/hb-backend-api/user/application/use-cases/approve-user.service";
import { GetPendingUsersService } from "../../../../../src/hb-backend-api/user/application/use-cases/get-pending-users.service";
import { RejectUserService } from "../../../../../src/hb-backend-api/user/application/use-cases/reject-user.service";
import { AddFriendsService } from "../../../../../src/hb-backend-api/user/application/use-cases/add-friends.service";
import { UserQueryPort } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.port";
import { UserPersistencePort } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-persistence.port";
import { UserEntitySchema } from "../../../../../src/hb-backend-api/user/domain/model/user.entity";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserNickname } from "../../../../../src/hb-backend-api/user/domain/model/user-nickname.vo";
import { ApprovalStatus } from "../../../../../src/hb-backend-api/user/domain/enums/approval-status.enum";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { TransactionRunner } from "../../../../../src/infra/mongo/transaction/transaction.runner";

// ---------- helpers ----------

function createUserId(hex?: string): UserId {
  return UserId.fromString(hex ?? new Types.ObjectId().toHexString());
}

function createUserEntity(
  overrides: Partial<{
    id: UserId;
    username: string;
    email: string;
    nickname: string;
    password: string;
    friends: Types.ObjectId[];
    approvalStatus: string;
    isAdmin: boolean;
  }> = {},
): UserEntitySchema {
  return UserEntitySchema.of(
    overrides.id ?? createUserId(),
    overrides.username ?? "testUser",
    overrides.email ?? "test@hobom.com",
    overrides.nickname ?? "testNick",
    overrides.password ?? "Password1!",
    overrides.friends,
    overrides.approvalStatus,
    overrides.isAdmin,
  );
}

// ---------- GetUserService ----------

describe("GetUserService", () => {
  let service: GetUserService;
  let userQueryPort: jest.Mocked<UserQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserService,
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByNickname: jest.fn(),
            findPendingUsers: jest.fn(),
            updateApprovalStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(GetUserService);
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
  });

  describe("invoke()", () => {
    it("should return UserQueryResult for a valid id", async () => {
      const userId = createUserId();
      const entity = createUserEntity({ id: userId, nickname: "Robin" });
      userQueryPort.findById.mockResolvedValue(entity);

      const result = await service.invoke(userId);

      expect(userQueryPort.findById).toHaveBeenCalledWith(userId);
      expect(result.getId).toBe(userId);
      expect(result.getNickname).toBe("Robin");
    });

    it("should propagate error when user not found", async () => {
      const userId = createUserId();
      userQueryPort.findById.mockRejectedValue(new Error("not found"));

      await expect(service.invoke(userId)).rejects.toThrow("not found");
    });
  });
});

// ---------- GetUserByNicknameService ----------

describe("GetUserByNicknameService", () => {
  let service: GetUserByNicknameService;
  let userQueryPort: jest.Mocked<UserQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByNicknameService,
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByNickname: jest.fn(),
            findPendingUsers: jest.fn(),
            updateApprovalStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(GetUserByNicknameService);
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
  });

  describe("invoke()", () => {
    it("should return UserQueryResult for a valid nickname", async () => {
      const nickname = UserNickname.fromString("Robin");
      const entity = createUserEntity({ nickname: "Robin" });
      userQueryPort.findByNickname.mockResolvedValue(entity);

      const result = await service.invoke(nickname);

      expect(userQueryPort.findByNickname).toHaveBeenCalledWith(nickname);
      expect(result.getNickname).toBe("Robin");
    });

    it("should propagate error when nickname not found", async () => {
      const nickname = UserNickname.fromString("Ghost");
      userQueryPort.findByNickname.mockRejectedValue(
        new Error("nickname not found"),
      );

      await expect(service.invoke(nickname)).rejects.toThrow(
        "nickname not found",
      );
    });
  });
});

// ---------- GetAllUserService ----------

describe("GetAllUserService", () => {
  let service: GetAllUserService;
  let userQueryPort: jest.Mocked<UserQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllUserService,
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByNickname: jest.fn(),
            findPendingUsers: jest.fn(),
            updateApprovalStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(GetAllUserService);
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
  });

  describe("invoke()", () => {
    it("should return array of UserQueryResult", async () => {
      const entities = [
        createUserEntity({ username: "User1", nickname: "nick1" }),
        createUserEntity({ username: "User2", nickname: "nick2" }),
      ];
      userQueryPort.findAll.mockResolvedValue(entities);

      const results = await service.invoke();

      expect(userQueryPort.findAll).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(2);
      expect(results[0].getUsername).toBe("User1");
      expect(results[1].getUsername).toBe("User2");
    });

    it("should return empty array when no users exist", async () => {
      userQueryPort.findAll.mockResolvedValue([]);

      const results = await service.invoke();

      expect(results).toHaveLength(0);
    });
  });
});

// ---------- ApproveUserService ----------

describe("ApproveUserService", () => {
  let service: ApproveUserService;
  let userQueryPort: jest.Mocked<UserQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveUserService,
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByNickname: jest.fn(),
            findPendingUsers: jest.fn(),
            updateApprovalStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ApproveUserService);
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
  });

  describe("invoke()", () => {
    it("should find user and update status to APPROVED", async () => {
      const userId = createUserId();
      const entity = createUserEntity({
        id: userId,
        approvalStatus: ApprovalStatus.PENDING,
      });
      userQueryPort.findById.mockResolvedValue(entity);
      userQueryPort.updateApprovalStatus.mockResolvedValue(undefined);

      await service.invoke(userId);

      expect(userQueryPort.findById).toHaveBeenCalledWith(userId);
      expect(userQueryPort.updateApprovalStatus).toHaveBeenCalledWith(
        userId,
        ApprovalStatus.APPROVED,
      );
    });

    it("should not update status when user not found", async () => {
      const userId = createUserId();
      userQueryPort.findById.mockRejectedValue(new Error("not found"));

      await expect(service.invoke(userId)).rejects.toThrow("not found");
      expect(userQueryPort.updateApprovalStatus).not.toHaveBeenCalled();
    });
  });
});

// ---------- GetPendingUsersService ----------

describe("GetPendingUsersService", () => {
  let service: GetPendingUsersService;
  let userQueryPort: jest.Mocked<UserQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPendingUsersService,
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByNickname: jest.fn(),
            findPendingUsers: jest.fn(),
            updateApprovalStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(GetPendingUsersService);
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
  });

  describe("invoke()", () => {
    it("should return pending users from query port", async () => {
      const pendingUsers = [
        createUserEntity({
          username: "Pending1",
          approvalStatus: ApprovalStatus.PENDING,
        }),
        createUserEntity({
          username: "Pending2",
          approvalStatus: ApprovalStatus.PENDING,
        }),
      ];
      userQueryPort.findPendingUsers.mockResolvedValue(pendingUsers);

      const results = await service.invoke();

      expect(userQueryPort.findPendingUsers).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(2);
      expect(results[0].getUsername).toBe("Pending1");
      expect(results[1].getUsername).toBe("Pending2");
    });

    it("should return empty array when no pending users", async () => {
      userQueryPort.findPendingUsers.mockResolvedValue([]);

      const results = await service.invoke();

      expect(results).toHaveLength(0);
    });
  });
});

// ---------- RejectUserService ----------

describe("RejectUserService", () => {
  let service: RejectUserService;
  let userQueryPort: jest.Mocked<UserQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RejectUserService,
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByNickname: jest.fn(),
            findPendingUsers: jest.fn(),
            updateApprovalStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RejectUserService);
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
  });

  describe("invoke()", () => {
    it("should find user and update status to REJECTED", async () => {
      const userId = createUserId();
      const entity = createUserEntity({
        id: userId,
        approvalStatus: ApprovalStatus.PENDING,
      });
      userQueryPort.findById.mockResolvedValue(entity);
      userQueryPort.updateApprovalStatus.mockResolvedValue(undefined);

      await service.invoke(userId);

      expect(userQueryPort.findById).toHaveBeenCalledWith(userId);
      expect(userQueryPort.updateApprovalStatus).toHaveBeenCalledWith(
        userId,
        ApprovalStatus.REJECTED,
      );
    });

    it("should not update status when user not found", async () => {
      const userId = createUserId();
      userQueryPort.findById.mockRejectedValue(new Error("not found"));

      await expect(service.invoke(userId)).rejects.toThrow("not found");
      expect(userQueryPort.updateApprovalStatus).not.toHaveBeenCalled();
    });
  });
});

// ---------- AddFriendsService ----------

describe("AddFriendsService", () => {
  let service: AddFriendsService;
  let userQueryPort: jest.Mocked<UserQueryPort>;
  let userPersistencePort: jest.Mocked<UserPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddFriendsService,
        {
          provide: DIToken.UserModule.UserPersistencePort,
          useValue: { save: jest.fn(), addFriend: jest.fn() },
        },
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByNickname: jest.fn(),
            findPendingUsers: jest.fn(),
            updateApprovalStatus: jest.fn(),
          },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb: () => Promise<void>) => cb()) },
        },
      ],
    }).compile();

    service = module.get(AddFriendsService);
    userQueryPort = module.get(DIToken.UserModule.UserQueryPort);
    userPersistencePort = module.get(DIToken.UserModule.UserPersistencePort);
  });

  describe("invoke()", () => {
    it("should add friend when not already added", async () => {
      const ownerId = createUserId();
      const friendId = createUserId();
      const entity = createUserEntity({ id: ownerId, friends: [] });
      userQueryPort.findById.mockResolvedValue(entity);
      userPersistencePort.addFriend.mockResolvedValue(undefined);

      await service.invoke(ownerId, friendId);

      expect(userQueryPort.findById).toHaveBeenCalledWith(ownerId);
      expect(userPersistencePort.addFriend).toHaveBeenCalledWith(
        ownerId,
        friendId,
      );
    });

    it("should throw BadRequestException when friend already exists", async () => {
      const ownerId = createUserId();
      const friendId = createUserId();
      // 이미 친구 목록에 friendId가 포함된 엔티티
      const entity = createUserEntity({
        id: ownerId,
        friends: [friendId.raw],
      });
      userQueryPort.findById.mockResolvedValue(entity);

      await expect(service.invoke(ownerId, friendId)).rejects.toThrow(
        BadRequestException,
      );
      expect(userPersistencePort.addFriend).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException with Korean message for duplicate friend", async () => {
      const ownerId = createUserId();
      const friendId = createUserId();
      const entity = createUserEntity({
        id: ownerId,
        friends: [friendId.raw],
      });
      userQueryPort.findById.mockResolvedValue(entity);

      await expect(service.invoke(ownerId, friendId)).rejects.toThrow(
        "이미 추가된 친구에요.",
      );
    });

    it("should propagate error when target user not found", async () => {
      const ownerId = createUserId();
      const friendId = createUserId();
      userQueryPort.findById.mockRejectedValue(new Error("not found"));

      await expect(service.invoke(ownerId, friendId)).rejects.toThrow(
        "not found",
      );
      expect(userPersistencePort.addFriend).not.toHaveBeenCalled();
    });
  });
});
