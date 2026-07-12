import { Prop, Schema } from "@nestjs/mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { LawVersionId } from "./law-version-id.vo";
import { LawArticle } from "./law-article.vo";

@Schema({ collection: "law_versions" })
export class LawVersionEntity extends BaseEntity {
  @Prop({ type: String, required: true, index: true })
  lawId: string;

  @Prop({ type: String, required: true })
  lawName: string;

  @Prop({ type: String, required: true })
  proclamationDate: string;

  @Prop({ type: String, required: true })
  enforcementDate: string;

  @Prop({
    type: [
      {
        articleNo: String,
        title: String,
        content: String,
        paragraphs: [
          {
            no: String,
            content: String,
            subItems: [{ no: String, content: String }],
          },
        ],
      },
    ],
    default: [],
  })
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

  @Prop({ type: String, default: null })
  rawXml: string;

  @Prop({ type: Date, required: true })
  fetchedAt: Date;
}

export class LawVersionEntitySchema {
  constructor(
    private readonly id: LawVersionId,
    private readonly lawId: string,
    private readonly lawName: string,
    private readonly proclamationDate: string,
    private readonly enforcementDate: string,
    private readonly articles: LawArticle[],
    private readonly rawXml: string,
    private readonly fetchedAt: Date,
  ) {}

  public static of(
    id: LawVersionId,
    lawId: string,
    lawName: string,
    proclamationDate: string,
    enforcementDate: string,
    articles: LawArticle[],
    rawXml: string,
    fetchedAt: Date,
  ): LawVersionEntitySchema {
    return new LawVersionEntitySchema(
      id,
      lawId,
      lawName,
      proclamationDate,
      enforcementDate,
      articles,
      rawXml,
      fetchedAt,
    );
  }

  get getId(): LawVersionId {
    return this.id;
  }
  get getLawId(): string {
    return this.lawId;
  }
  get getLawName(): string {
    return this.lawName;
  }
  get getProclamationDate(): string {
    return this.proclamationDate;
  }
  get getEnforcementDate(): string {
    return this.enforcementDate;
  }
  get getArticles(): LawArticle[] {
    return this.articles;
  }
  get getRawXml(): string {
    return this.rawXml;
  }
  get getFetchedAt(): Date {
    return this.fetchedAt;
  }
}
