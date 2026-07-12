import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LawDiffRepository } from "../../domain/repositories/law-diff.repository";
import { LawDiffEntity } from "../../domain/model/law-diff.entity";
import { LawDiffDocument } from "../../domain/model/law-diff.schema";
import { LawDiffId } from "../../domain/model/law-diff-id.vo";
import { LawVersionId } from "../../domain/model/law-version-id.vo";
import { ChangeType } from "../../domain/enums/change-type.enum";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class LawDiffRepositoryImpl implements LawDiffRepository {
  constructor(
    @InjectModel(LawDiffEntity.name)
    private readonly model: Model<LawDiffDocument>,
  ) {}

  public async save(data: {
    fromVersionId: string;
    toVersionId: string;
    fromProclamationDate: string;
    toProclamationDate: string;
    changes: {
      articleNo: string;
      changeType: ChangeType;
      before: string | null;
      after: string | null;
    }[];
  }): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.model.create(
      [
        {
          fromVersionId: data.fromVersionId,
          toVersionId: data.toVersionId,
          fromProclamationDate: data.fromProclamationDate,
          toProclamationDate: data.toProclamationDate,
          changes: data.changes,
        },
      ],
      { session },
    );
  }

  public async findAll(): Promise<LawDiffDocument[]> {
    return (await this.model
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown as LawDiffDocument[];
  }

  public async findById(id: LawDiffId): Promise<LawDiffDocument> {
    const found = await this.model.findOne({ _id: id.raw }).lean().exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 법률 차이를 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found as unknown as LawDiffDocument;
  }

  public async findByVersionId(
    versionId: LawVersionId,
  ): Promise<LawDiffDocument[]> {
    const session = MongoSessionContext.getSession();
    return (await this.model
      .find({ toVersionId: versionId.toString() })
      .session(session ?? null)
      .lean()
      .exec()) as unknown as LawDiffDocument[];
  }
}
