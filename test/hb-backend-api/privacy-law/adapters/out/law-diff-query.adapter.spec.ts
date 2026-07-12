import { Types } from "mongoose";
import { LawDiffQueryAdapter } from "../../../../../src/hb-backend-api/privacy-law/adapters/out/law-diff-query.adapter";
import { LawDiffRepository } from "../../../../../src/hb-backend-api/privacy-law/domain/repositories/law-diff.repository";
import { LawDiffEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-diff.entity";
import { LawDiffId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-diff-id.vo";
import { LawVersionId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-version-id.vo";
import { ChangeType } from "../../../../../src/hb-backend-api/privacy-law/domain/enums/change-type.enum";

describe("LawDiffQueryAdapter", () => {
  let adapter: LawDiffQueryAdapter;
  let repository: jest.Mocked<LawDiffRepository>;

  const createMockDoc = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    fromVersionId: new Types.ObjectId(),
    toVersionId: new Types.ObjectId(),
    fromProclamationDate: "2025-01-01",
    toProclamationDate: "2026-01-01",
    changes: [
      {
        articleNo: "제1조",
        changeType: ChangeType.MODIFIED,
        before: "이전 내용",
        after: "변경 내용",
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByVersionId: jest.fn(),
    };
    adapter = new LawDiffQueryAdapter(repository);
  });

  describe("findAll()", () => {
    it("should return mapped LawDiffEntitySchema array", async () => {
      repository.findAll.mockResolvedValue([createMockDoc()] as never);

      const result = await adapter.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(LawDiffEntitySchema);
      expect(result[0].getFromProclamationDate).toBe("2025-01-01");
      expect(result[0].getToProclamationDate).toBe("2026-01-01");
    });

    it("should return empty array when no documents exist", async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(result).toEqual([]);
    });

    it("should map changes correctly", async () => {
      repository.findAll.mockResolvedValue([createMockDoc()] as never);

      const result = await adapter.findAll();

      expect(result[0].getChanges).toHaveLength(1);
      expect(result[0].getChanges[0].getArticleNo).toBe("제1조");
      expect(result[0].getChanges[0].getChangeType).toBe(ChangeType.MODIFIED);
    });
  });

  describe("findById()", () => {
    it("should return a LawDiffEntitySchema for existing id", async () => {
      const doc = createMockDoc();
      repository.findById.mockResolvedValue(doc as never);

      const id = LawDiffId.fromString(doc._id.toHexString());
      const result = await adapter.findById(id);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(LawDiffEntitySchema);
      expect(result.getFromProclamationDate).toBe("2025-01-01");
    });
  });

  describe("findByVersionId()", () => {
    it("should return mapped LawDiffEntitySchema array for a version", async () => {
      repository.findByVersionId.mockResolvedValue([createMockDoc()] as never);

      const versionId = LawVersionId.fromString(
        new Types.ObjectId().toHexString(),
      );
      const result = await adapter.findByVersionId(versionId);

      expect(repository.findByVersionId).toHaveBeenCalledWith(versionId);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(LawDiffEntitySchema);
    });

    it("should return empty array when no diffs for version", async () => {
      repository.findByVersionId.mockResolvedValue([]);

      const versionId = LawVersionId.fromString(
        new Types.ObjectId().toHexString(),
      );
      const result = await adapter.findByVersionId(versionId);

      expect(result).toEqual([]);
    });
  });
});
