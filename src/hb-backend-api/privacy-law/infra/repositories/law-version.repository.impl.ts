import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LawVersionRepository } from "../../domain/repositories/law-version.repository";
import { LawVersionEntity } from "../../domain/model/law-version.entity";
import { LawVersionDocument } from "../../domain/model/law-version.schema";
import { LawVersionId } from "../../domain/model/law-version-id.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class LawVersionRepositoryImpl implements LawVersionRepository {
  constructor(
    @InjectModel(LawVersionEntity.name)
    private readonly model: Model<LawVersionDocument>,
  ) {}

  public async save(data: {
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
  }): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.model.create(
      [
        {
          lawId: data.lawId,
          lawName: data.lawName,
          proclamationDate: data.proclamationDate,
          enforcementDate: data.enforcementDate,
          articles: data.articles,
          rawXml: data.rawXml,
          fetchedAt: data.fetchedAt,
        },
      ],
      { session },
    );
  }

  public async findAll(): Promise<LawVersionDocument[]> {
    return (await this.model
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown as LawVersionDocument[];
  }

  public async findById(id: LawVersionId): Promise<LawVersionDocument> {
    const found = await this.model.findOne({ _id: id.raw }).lean().exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 법률 버전을 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found as unknown as LawVersionDocument;
  }

  public async findLatest(): Promise<LawVersionDocument | null> {
    const session = MongoSessionContext.getSession();
    return (await this.model
      .findOne()
      .sort({ createdAt: -1 })
      .session(session ?? null)
      .lean()
      .exec()) as unknown as LawVersionDocument | null;
  }
}
