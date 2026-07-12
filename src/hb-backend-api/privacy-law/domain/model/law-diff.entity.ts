import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { ChangeType } from "../enums/change-type.enum";
import { LawDiffId } from "./law-diff-id.vo";
import { LawVersionId } from "./law-version-id.vo";
import { ArticleChange } from "./article-change.vo";

@Schema({ collection: "law_diffs" })
export class LawDiffEntity extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: "LawVersionEntity", required: true })
  fromVersionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "LawVersionEntity", required: true })
  toVersionId: Types.ObjectId;

  @Prop({ type: String, required: true })
  fromProclamationDate: string;

  @Prop({ type: String, required: true })
  toProclamationDate: string;

  @Prop({
    type: [
      {
        articleNo: String,
        changeType: { type: String, enum: ChangeType },
        before: { type: String, default: null },
        after: { type: String, default: null },
      },
    ],
    default: [],
  })
  changes: {
    articleNo: string;
    changeType: ChangeType;
    before: string | null;
    after: string | null;
  }[];
}

export class LawDiffEntitySchema {
  constructor(
    private readonly id: LawDiffId,
    private readonly fromVersionId: LawVersionId,
    private readonly toVersionId: LawVersionId,
    private readonly fromProclamationDate: string,
    private readonly toProclamationDate: string,
    private readonly changes: ArticleChange[],
  ) {}

  public static of(
    id: LawDiffId,
    fromVersionId: LawVersionId,
    toVersionId: LawVersionId,
    fromProclamationDate: string,
    toProclamationDate: string,
    changes: ArticleChange[],
  ): LawDiffEntitySchema {
    return new LawDiffEntitySchema(
      id,
      fromVersionId,
      toVersionId,
      fromProclamationDate,
      toProclamationDate,
      changes,
    );
  }

  get getId(): LawDiffId {
    return this.id;
  }
  get getFromVersionId(): LawVersionId {
    return this.fromVersionId;
  }
  get getToVersionId(): LawVersionId {
    return this.toVersionId;
  }
  get getFromProclamationDate(): string {
    return this.fromProclamationDate;
  }
  get getToProclamationDate(): string {
    return this.toProclamationDate;
  }
  get getChanges(): ArticleChange[] {
    return this.changes;
  }
}
