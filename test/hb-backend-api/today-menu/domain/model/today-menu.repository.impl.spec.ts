import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { TodayMenuRepositoryImpl } from "../../../../../src/hb-backend-api/today-menu/domain/model/today-menu.repository.impl";
import { TodayMenuEntity } from "../../../../../src/hb-backend-api/today-menu/domain/model/today-menu.entity";
import { TodayMenuId } from "../../../../../src/hb-backend-api/today-menu/domain/model/today-menu.vo";
import { TodayMenuAggregator } from "../../../../../src/hb-backend-api/today-menu/domain/today-menu-aggregator.helper";

jest.mock("src/infra/mongo/transaction/transaction.context", () => ({
  MongoSessionContext: { getSession: jest.fn().mockReturnValue(undefined) },
}));

describe("TodayMenuRepositoryImpl", () => {
  let repository: TodayMenuRepositoryImpl;

  const mockExec = jest.fn();
  const mockModel = {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    aggregate: jest.fn().mockReturnValue({ exec: mockExec }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockModel.aggregate.mockReturnValue({ exec: mockExec });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodayMenuRepositoryImpl,
        {
          provide: getModelToken(TodayMenuEntity.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get(TodayMenuRepositoryImpl);
  });

  const createEntity = (options: {
    id?: Types.ObjectId;
    recommendedMenu?: Types.ObjectId;
    candidates?: Types.ObjectId[];
    recommendationDate?: string;
  }) => ({
    getTodayMenuId: options.id ? { raw: options.id } : null,
    getRecommendedMenu: options.recommendedMenu
      ? { raw: options.recommendedMenu }
      : null,
    getCandidates: (options.candidates ?? []).map((c) => ({ raw: c })),
    getRecommendationDate: options.recommendationDate
      ? { value: options.recommendationDate }
      : null,
  });

  describe("upsert", () => {
    describe("create path (id == null)", () => {
      it("should create document with null recommendedMenu when absent", async () => {
        const createdId = new Types.ObjectId();
        const candidateId = new Types.ObjectId();
        const entity = createEntity({
          candidates: [candidateId],
          recommendationDate: "2026-03-14",
        });
        mockModel.create.mockResolvedValue([{ _id: createdId }]);

        const result = await repository.upsert(entity as any);

        expect(mockModel.create).toHaveBeenCalledWith(
          [
            {
              recommendedMenu: undefined,
              candidates: [candidateId],
              recommendationDate: "2026-03-14",
            },
          ],
          { session: undefined },
        );
        expect(result).toBeInstanceOf(TodayMenuId);
        expect(result.raw.equals(createdId)).toBe(true);
      });

      it("should create document with recommendedMenu.raw when present", async () => {
        const createdId = new Types.ObjectId();
        const recommendedMenuId = new Types.ObjectId();
        const candidateId = new Types.ObjectId();
        const entity = createEntity({
          recommendedMenu: recommendedMenuId,
          candidates: [candidateId],
          recommendationDate: "2026-03-14",
        });
        mockModel.create.mockResolvedValue([{ _id: createdId }]);

        const result = await repository.upsert(entity as any);

        expect(mockModel.create).toHaveBeenCalledWith(
          [
            {
              recommendedMenu: recommendedMenuId,
              candidates: [candidateId],
              recommendationDate: "2026-03-14",
            },
          ],
          { session: undefined },
        );
        expect(result.raw.equals(createdId)).toBe(true);
      });

      it("should create document with null recommendationDate when absent", async () => {
        const createdId = new Types.ObjectId();
        const entity = createEntity({ candidates: [] });
        mockModel.create.mockResolvedValue([{ _id: createdId }]);

        await repository.upsert(entity as any);

        expect(mockModel.create).toHaveBeenCalledWith(
          [
            {
              recommendedMenu: undefined,
              candidates: [],
              recommendationDate: undefined,
            },
          ],
          { session: undefined },
        );
      });
    });

    describe("update path (id != null)", () => {
      it("should call findOneAndUpdate with $set", async () => {
        const existingId = new Types.ObjectId();
        const recommendedMenuId = new Types.ObjectId();
        const candidateId = new Types.ObjectId();
        const entity = createEntity({
          id: existingId,
          recommendedMenu: recommendedMenuId,
          candidates: [candidateId],
          recommendationDate: "2026-03-14",
        });
        mockModel.findOneAndUpdate.mockResolvedValue({ _id: existingId });

        const result = await repository.upsert(entity as any);

        expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: existingId },
          {
            $set: {
              recommendedMenu: recommendedMenuId,
              candidates: [candidateId],
              recommendationDate: "2026-03-14",
            },
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
            new: true,
            session: undefined,
          },
        );
        expect(result.raw.equals(existingId)).toBe(true);
      });

      it("should pass null when recommendedMenu is absent", async () => {
        const existingId = new Types.ObjectId();
        const entity = createEntity({
          id: existingId,
          candidates: [],
        });
        mockModel.findOneAndUpdate.mockResolvedValue({ _id: existingId });

        await repository.upsert(entity as any);

        const setArg = mockModel.findOneAndUpdate.mock.calls[0][1]["$set"];
        expect(setArg.recommendedMenu).toBeNull();
      });

      it("should pass null when recommendationDate is absent", async () => {
        const existingId = new Types.ObjectId();
        const entity = createEntity({
          id: existingId,
          candidates: [],
        });
        mockModel.findOneAndUpdate.mockResolvedValue({ _id: existingId });

        await repository.upsert(entity as any);

        const setArg = mockModel.findOneAndUpdate.mock.calls[0][1]["$set"];
        expect(setArg.recommendationDate).toBeNull();
      });
    });
  });

  describe("findById", () => {
    it("should aggregate with $match and $limit", async () => {
      const id = TodayMenuId.fromString(new Types.ObjectId().toHexString());
      const expected = { id: id.raw, candidates: [] };
      mockExec.mockResolvedValue([expected]);

      const result = await repository.findById(id);

      expect(mockModel.aggregate).toHaveBeenCalledWith([
        { $match: { _id: id.raw } },
        ...TodayMenuAggregator.buildPipeline(),
        { $limit: 1 },
      ]);
      expect(result).toBe(expected);
    });
  });

  describe("findRecommendedMenuById", () => {
    it("should return result[0] when found", async () => {
      const id = TodayMenuId.fromString(new Types.ObjectId().toHexString());
      const expected = { id: id.raw, candidates: [] };
      mockExec.mockResolvedValue([expected]);

      const result = await repository.findRecommendedMenuById(id);

      expect(mockModel.aggregate).toHaveBeenCalledWith([
        { $match: { recommendedMenu: id.raw } },
        ...TodayMenuAggregator.buildPipeline(),
      ]);
      expect(result).toBe(expected);
    });

    it("should throw NotFoundException when result is empty", async () => {
      const id = TodayMenuId.fromString(new Types.ObjectId().toHexString());
      mockExec.mockResolvedValue([]);

      await expect(repository.findRecommendedMenuById(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
