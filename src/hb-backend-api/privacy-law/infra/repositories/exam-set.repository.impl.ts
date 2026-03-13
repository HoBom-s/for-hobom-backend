import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExamSetRepository } from "../../domain/repositories/exam-set.repository";
import { ExamSetEntity } from "../../domain/model/exam-set.entity";
import { ExamSetDocument } from "../../domain/model/exam-set.schema";

@Injectable()
export class ExamSetRepositoryImpl implements ExamSetRepository {
  constructor(
    @InjectModel(ExamSetEntity.name)
    private readonly model: Model<ExamSetDocument>,
  ) {}

  public async save(data: {
    title: string;
    version: number;
    lawVersionId: string;
    totalQuestions: number;
    questions: {
      no: number;
      subject: string;
      type: string;
      question: string;
      choices: string[];
      answer: string;
      explanation: string;
    }[];
  }): Promise<ExamSetDocument> {
    return this.model.create(data);
  }

  public async findAll(): Promise<ExamSetDocument[]> {
    return this.model.find().sort({ version: -1 }).exec();
  }

  public async findById(id: string): Promise<ExamSetDocument | null> {
    return this.model.findById(id).exec();
  }

  public async countAll(): Promise<number> {
    return this.model.countDocuments().exec();
  }
}
