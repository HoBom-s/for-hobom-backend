import { Types } from "mongoose";
import { LabelQueryAdapter } from "../../../../../src/hb-backend-api/label/adapters/out/label-query.adapter";
import { LabelRepository } from "../../../../../src/hb-backend-api/label/domain/model/label.repository";
import { LabelEntitySchema } from "../../../../../src/hb-backend-api/label/domain/model/label.entity";
import { LabelId } from "../../../../../src/hb-backend-api/label/domain/model/label-id.vo";
import { LabelTitle } from "../../../../../src/hb-backend-api/label/domain/model/label-title.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";

describe("LabelQueryAdapter", () => {
  let adapter: LabelQueryAdapter;
  let repository: jest.Mocked<LabelRepository>;

  const createMockDoc = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    title: "Test Label",
    owner: new Types.ObjectId(),
    ...overrides,
  });

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTitle: jest.fn(),
      updateTitle: jest.fn(),
      deleteOne: jest.fn(),
    };
    adapter = new LabelQueryAdapter(repository);
  });

  describe("findById()", () => {
    it("should return a LabelEntitySchema mapped from the document", async () => {
      const doc = createMockDoc();
      repository.findById.mockResolvedValue(doc as never);

      const labelId = new LabelId(new Types.ObjectId());
      const owner = new UserId(new Types.ObjectId());
      const result = await adapter.findById(labelId, owner);

      expect(repository.findById).toHaveBeenCalledWith(labelId, owner);
      expect(result).toBeInstanceOf(LabelEntitySchema);
      expect(result.getTitle).toEqual(LabelTitle.fromString("Test Label"));
    });
  });

  describe("findAll()", () => {
    it("should return mapped LabelEntitySchema array", async () => {
      repository.findAll.mockResolvedValue([createMockDoc()] as never);

      const owner = new UserId(new Types.ObjectId());
      const result = await adapter.findAll(owner);

      expect(repository.findAll).toHaveBeenCalledWith(owner);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(LabelEntitySchema);
    });

    it("should return empty array when no documents exist", async () => {
      repository.findAll.mockResolvedValue([]);

      const owner = new UserId(new Types.ObjectId());
      const result = await adapter.findAll(owner);

      expect(result).toEqual([]);
    });
  });

  describe("findByTitle()", () => {
    it("should return a LabelEntitySchema when document found", async () => {
      const doc = createMockDoc();
      repository.findByTitle.mockResolvedValue(doc as never);

      const title = LabelTitle.fromString("Test Label");
      const owner = new UserId(new Types.ObjectId());
      const result = await adapter.findByTitle(title, owner);

      expect(repository.findByTitle).toHaveBeenCalledWith(title, owner);
      expect(result).toBeInstanceOf(LabelEntitySchema);
      expect(result!.getTitle).toEqual(LabelTitle.fromString("Test Label"));
    });

    it("should return null when document not found", async () => {
      repository.findByTitle.mockResolvedValue(null);

      const title = LabelTitle.fromString("Nonexistent");
      const owner = new UserId(new Types.ObjectId());
      const result = await adapter.findByTitle(title, owner);

      expect(result).toBeNull();
    });
  });
});
