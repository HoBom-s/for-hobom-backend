import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { LabelController } from "../../../../../src/hb-backend-api/label/adapters/in/label.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { LabelQueryResult } from "../../../../../src/hb-backend-api/label/domain/ports/out/label-query.result";
import { LabelId } from "../../../../../src/hb-backend-api/label/domain/model/label-id.vo";
import { LabelTitle } from "../../../../../src/hb-backend-api/label/domain/model/label-title.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserQueryResult } from "../../../../../src/hb-backend-api/user/domain/ports/out/user-query.result";
import { TokenUserInformation } from "../../../../../src/shared/adapters/in/rest/decorator/access-token.decorator";

describe("LabelController", () => {
  let controller: LabelController;
  const mockGetUserByNicknameUseCase = { invoke: jest.fn() };
  const mockCreateLabelUseCase = { invoke: jest.fn() };
  const mockGetAllLabelsUseCase = { invoke: jest.fn() };
  const mockGetLabelUseCase = { invoke: jest.fn() };
  const mockPatchLabelUseCase = { invoke: jest.fn() };
  const mockDeleteLabelUseCase = { invoke: jest.fn() };

  const userId = UserId.fromString(new Types.ObjectId().toHexString());
  const mockUser = new UserQueryResult(
    userId,
    "testuser",
    "test@test.com",
    "Robin",
    [],
  );
  const userInfo: TokenUserInformation = {
    nickname: "Robin",
  } as TokenUserInformation;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelController],
      providers: [
        {
          provide: DIToken.UserModule.GetUserByNicknameUseCase,
          useValue: mockGetUserByNicknameUseCase,
        },
        {
          provide: DIToken.LabelModule.CreateLabelUseCase,
          useValue: mockCreateLabelUseCase,
        },
        {
          provide: DIToken.LabelModule.GetAllLabelsUseCase,
          useValue: mockGetAllLabelsUseCase,
        },
        {
          provide: DIToken.LabelModule.GetLabelUseCase,
          useValue: mockGetLabelUseCase,
        },
        {
          provide: DIToken.LabelModule.PatchLabelUseCase,
          useValue: mockPatchLabelUseCase,
        },
        {
          provide: DIToken.LabelModule.DeleteLabelUseCase,
          useValue: mockDeleteLabelUseCase,
        },
      ],
    }).compile();

    controller = module.get(LabelController);
    mockGetUserByNicknameUseCase.invoke.mockResolvedValue(mockUser);
  });

  describe("create", () => {
    it("should resolve user and call createLabelUseCase", async () => {
      mockCreateLabelUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(userInfo, { title: "urgent" });

      expect(mockGetUserByNicknameUseCase.invoke).toHaveBeenCalledTimes(1);
      expect(mockCreateLabelUseCase.invoke).toHaveBeenCalledTimes(1);
      const command = mockCreateLabelUseCase.invoke.mock.calls[0][0];
      expect(command.getTitle.raw).toBe("urgent");
      expect(command.getOwner.toString()).toBe(userId.toString());
    });

    it("should propagate use case error", async () => {
      mockCreateLabelUseCase.invoke.mockRejectedValue(
        new Error("duplicate label"),
      );

      await expect(
        controller.create(userInfo, { title: "urgent" }),
      ).rejects.toThrow("duplicate label");
    });
  });

  describe("getAll", () => {
    it("should return mapped GetLabelDto array", async () => {
      const labelId = LabelId.fromString(new Types.ObjectId().toHexString());
      const queryResult = new LabelQueryResult(
        labelId,
        LabelTitle.fromString("work"),
        userId,
      );
      mockGetAllLabelsUseCase.invoke.mockResolvedValue([queryResult]);

      const result = await controller.getAll(userInfo);

      expect(mockGetAllLabelsUseCase.invoke).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(labelId.toString());
      expect(result[0].title).toBe("work");
      expect(result[0].ownerId).toBe(userId.toString());
    });

    it("should return empty array when no labels", async () => {
      mockGetAllLabelsUseCase.invoke.mockResolvedValue([]);

      const result = await controller.getAll(userInfo);

      expect(result).toEqual([]);
    });
  });

  describe("getOne", () => {
    it("should return mapped GetLabelDto", async () => {
      const labelId = LabelId.fromString(new Types.ObjectId().toHexString());
      const queryResult = new LabelQueryResult(
        labelId,
        LabelTitle.fromString("personal"),
        userId,
      );
      mockGetLabelUseCase.invoke.mockResolvedValue(queryResult);

      const result = await controller.getOne(userInfo, labelId);

      expect(mockGetLabelUseCase.invoke).toHaveBeenCalledWith(labelId, userId);
      expect(result.id).toBe(labelId.toString());
      expect(result.title).toBe("personal");
    });

    it("should propagate not found error", async () => {
      const labelId = LabelId.fromString(new Types.ObjectId().toHexString());
      mockGetLabelUseCase.invoke.mockRejectedValue(
        new Error("label not found"),
      );

      await expect(controller.getOne(userInfo, labelId)).rejects.toThrow(
        "label not found",
      );
    });
  });

  describe("update", () => {
    it("should resolve user and call patchLabelUseCase", async () => {
      const labelId = LabelId.fromString(new Types.ObjectId().toHexString());
      mockPatchLabelUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(userInfo, labelId, { title: "updated" });

      expect(mockPatchLabelUseCase.invoke).toHaveBeenCalledTimes(1);
      const [passedId, command] = mockPatchLabelUseCase.invoke.mock
        .calls[0] as [
        unknown,
        { getTitle: { raw: string }; getOwner: { toString: () => string } },
      ];
      expect(passedId).toBe(labelId);
      expect(command.getTitle.raw).toBe("updated");
      expect(command.getOwner.toString()).toBe(userId.toString());
    });
  });

  describe("delete", () => {
    it("should resolve user and call deleteLabelUseCase", async () => {
      const labelId = LabelId.fromString(new Types.ObjectId().toHexString());
      mockDeleteLabelUseCase.invoke.mockResolvedValue(undefined);

      await controller.delete(userInfo, labelId);

      expect(mockDeleteLabelUseCase.invoke).toHaveBeenCalledWith(
        labelId,
        userId,
      );
    });

    it("should propagate use case error", async () => {
      const labelId = LabelId.fromString(new Types.ObjectId().toHexString());
      mockDeleteLabelUseCase.invoke.mockRejectedValue(new Error("forbidden"));

      await expect(controller.delete(userInfo, labelId)).rejects.toThrow(
        "forbidden",
      );
    });
  });
});
