import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StudyMaterialRepository } from "../../domain/repositories/study-material.repository";
import { StudyMaterialEntity } from "../../domain/model/study-material.entity";
import { StudyMaterialDocument } from "../../domain/model/study-material.schema";
import { StudyMaterialId } from "../../domain/model/study-material-id.vo";
import { LawDiffId } from "../../domain/model/law-diff-id.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class StudyMaterialRepositoryImpl implements StudyMaterialRepository {
  constructor(
    @InjectModel(StudyMaterialEntity.name)
    private readonly model: Model<StudyMaterialDocument>,
  ) {}

  public async save(data: {
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
  }): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.model.create(
      [
        {
          diffId: data.diffId,
          summary: data.summary,
          keyPoints: data.keyPoints,
          quizzes: data.quizzes,
        },
      ],
      { session },
    );
  }

  public async findAll(): Promise<StudyMaterialDocument[]> {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  public async findById(id: StudyMaterialId): Promise<StudyMaterialDocument> {
    const found = await this.model.findOne({ _id: id.raw }).exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 학습 자료를 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found;
  }

  public async findByDiffId(
    diffId: LawDiffId,
  ): Promise<StudyMaterialDocument | null> {
    return this.model.findOne({ diffId: diffId.raw }).exec();
  }
}
