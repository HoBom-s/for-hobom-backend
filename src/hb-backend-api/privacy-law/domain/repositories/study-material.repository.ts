import { StudyMaterialId } from "../model/study-material-id.vo";
import { LawDiffId } from "../model/law-diff-id.vo";
import { StudyMaterialDocument } from "../model/study-material.schema";

export interface StudyMaterialRepository {
  save(data: {
    diffId: string;
    summary: string;
    keyPoints: string[];
    quizzes: {
      type: string;
      question: string;
      answer: string;
      explanation: string;
      choices: string[];
    }[];
  }): Promise<void>;
  findAll(): Promise<StudyMaterialDocument[]>;
  findById(id: StudyMaterialId): Promise<StudyMaterialDocument>;
  findByDiffId(diffId: LawDiffId): Promise<StudyMaterialDocument | null>;
}
