import { LawVersionId } from "../model/law-version-id.vo";
import { LawVersionDocument } from "../model/law-version.schema";

export interface LawVersionRepository {
  save(data: {
    lawId: string;
    lawName: string;
    proclamationDate: string;
    enforcementDate: string;
    articles: {
      articleNo: string;
      title: string;
      content: string;
      paragraphs: {
        no: string;
        content: string;
        subItems: { no: string; content: string }[];
      }[];
    }[];
    rawXml: string;
    fetchedAt: Date;
  }): Promise<void>;
  findAll(): Promise<LawVersionDocument[]>;
  findById(id: LawVersionId): Promise<LawVersionDocument>;
  findLatest(): Promise<LawVersionDocument | null>;
}
