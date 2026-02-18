import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserService } from "../../../../../src/hb-backend-api/user/application/use-cases/create-user.service";
import { UserPersistencePort } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-persistence.port";
import { CreateUserCommand } from "../../../../../src/hb-backend-api/user/domain/ports/out/create-user.command";
import { UserCreateEntitySchema } from "../../../../../src/hb-backend-api/user/domain/model/user.entity";
import { DIToken } from "../../../../../src/shared/di/token.di";

describe("CreateUserService", () => {
  let service: CreateUserService;
  let userPersistencePort: jest.Mocked<UserPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        {
          provide: DIToken.UserModule.UserPersistencePort,
          useValue: { save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(CreateUserService);
    userPersistencePort = module.get(DIToken.UserModule.UserPersistencePort);
  });

  describe("invoke()", () => {
    it("should call userPersistencePort.save with a UserCreateEntitySchema", async () => {
      const command = CreateUserCommand.of(
        "Robin Yeon",
        "Robin",
        "robin@hobom.com",
        "Password1!",
      );
      userPersistencePort.save.mockResolvedValue(undefined);

      await service.invoke(command);

      expect(userPersistencePort.save).toHaveBeenCalledTimes(1);
      const savedUser: UserCreateEntitySchema =
        userPersistencePort.save.mock.calls[0][0];
      expect(savedUser.getUsername).toBe("Robin Yeon");
      expect(savedUser.getNickname).toBe("Robin");
      expect(savedUser.getEmail).toBe("robin@hobom.com");
      expect(savedUser.getPassword).toBe("Password1!");
    });

    it("should pass username and nickname in correct order", async () => {
      const command = CreateUserCommand.of(
        "actualUsername",
        "actualNickname",
        "test@hobom.com",
        "Pass1!abc",
      );
      userPersistencePort.save.mockResolvedValue(undefined);

      await service.invoke(command);

      const savedUser: UserCreateEntitySchema =
        userPersistencePort.save.mock.calls[0][0];
      // 이전에 username과 nickname이 뒤바뀌는 버그가 있었음 — 회귀 방지
      expect(savedUser.getUsername).toBe("actualUsername");
      expect(savedUser.getNickname).toBe("actualNickname");
    });
  });
});
