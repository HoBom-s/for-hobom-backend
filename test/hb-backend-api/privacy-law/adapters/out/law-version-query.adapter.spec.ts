import { Types } from "mongoose";
import { LawVersionQueryAdapter } from "../../../../../src/hb-backend-api/privacy-law/adapters/out/law-version-query.adapter";
import { LawVersionRepository } from "../../../../../src/hb-backend-api/privacy-law/domain/repositories/law-version.repository";
import { LawVersionEntitySchema } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-version.entity";
import { LawVersionId } from "../../../../../src/hb-backend-api/privacy-law/domain/model/law-version-id.vo";

describe("LawVersionQueryAdapter", () => {
  let adapter: LawVersionQueryAdapter;
  let repository: jest.Mocked<LawVersionRepository>;

  const createMockDoc = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    lawId: "LAW-001",
    lawName: "개인정보 보호법",
    proclamationDate: "2025-01-01",
    enforcementDate: "2025-03-01",
    articles: [
      {
        articleNo: "제1조",
        title: "목적",
        content: "이 법은 개인정보의 처리에 관한 사항을 정함",
        paragraphs: [],
      },
    ],
    rawXml: "<xml>raw</xml>",
    fetchedAt: new Date("2025-01-15"),
    ...overrides,
  });

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findLatest: jest.fn(),
    };
    adapter = new LawVersionQueryAdapter(repository);
  });

  describe("findAll()", () => {
    it("should return mapped LawVersionEntitySchema array", async () => {
      repository.findAll.mockResolvedValue([createMockDoc()] as never);

      const result = await adapter.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(LawVersionEntitySchema);
      expect(result[0].getLawId).toBe("LAW-001");
      expect(result[0].getLawName).toBe("개인정보 보호법");
      expect(result[0].getProclamationDate).toBe("2025-01-01");
      expect(result[0].getEnforcementDate).toBe("2025-03-01");
    });

    it("should return empty array when no documents exist", async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(result).toEqual([]);
    });

    it("should map articles correctly", async () => {
      repository.findAll.mockResolvedValue([createMockDoc()] as never);

      const result = await adapter.findAll();

      expect(result[0].getArticles).toHaveLength(1);
      expect(result[0].getArticles[0].getArticleNo).toBe("제1조");
      expect(result[0].getArticles[0].getTitle).toBe("목적");
    });
  });

  describe("findById()", () => {
    it("should return a LawVersionEntitySchema for existing id", async () => {
      const doc = createMockDoc();
      repository.findById.mockResolvedValue(doc as never);

      const id = LawVersionId.fromString(doc._id.toHexString());
      const result = await adapter.findById(id);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(LawVersionEntitySchema);
      expect(result.getLawName).toBe("개인정보 보호법");
      expect(result.getRawXml).toBe("<xml>raw</xml>");
    });
  });

  describe("findLatest()", () => {
    it("should return a LawVersionEntitySchema when latest exists", async () => {
      const doc = createMockDoc();
      repository.findLatest.mockResolvedValue(doc as never);

      const result = await adapter.findLatest();

      expect(repository.findLatest).toHaveBeenCalled();
      expect(result).toBeInstanceOf(LawVersionEntitySchema);
      expect(result!.getLawId).toBe("LAW-001");
    });

    it("should return null when no latest version exists", async () => {
      repository.findLatest.mockResolvedValue(null);

      const result = await adapter.findLatest();

      expect(result).toBeNull();
    });
  });
});
