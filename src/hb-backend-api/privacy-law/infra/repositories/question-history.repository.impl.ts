import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { QuestionHistoryRepository } from "../../domain/repositories/question-history.repository";
import { QuestionHistoryEntity } from "../../domain/model/question-history.entity";
import { QuestionHistoryDocument } from "../../domain/model/question-history.schema";

@Injectable()
export class QuestionHistoryRepositoryImpl
  implements QuestionHistoryRepository
{
  constructor(
    @InjectModel(QuestionHistoryEntity.name)
    private readonly model: Model<QuestionHistoryDocument>,
  ) {}

  public async save(data: {
    question: string;
    answer: string;
    referencedArticles: string[];
  }): Promise<void> {
    await this.model.create(data);
  }

  public async findAll(): Promise<QuestionHistoryDocument[]> {
    return (await this.model
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown as QuestionHistoryDocument[];
  }
}
