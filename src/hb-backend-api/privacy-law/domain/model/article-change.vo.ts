import { ChangeType } from "../enums/change-type.enum";

export class ArticleChange {
  constructor(
    private readonly articleNo: string,
    private readonly changeType: ChangeType,
    private readonly before: string | null,
    private readonly after: string | null,
  ) {
    Object.freeze(this);
  }

  public static of(
    articleNo: string,
    changeType: ChangeType,
    before: string | null,
    after: string | null,
  ): ArticleChange {
    return new ArticleChange(articleNo, changeType, before, after);
  }

  public get getArticleNo(): string {
    return this.articleNo;
  }

  public get getChangeType(): ChangeType {
    return this.changeType;
  }

  public get getBefore(): string | null {
    return this.before;
  }

  public get getAfter(): string | null {
    return this.after;
  }

  public toPlain(): {
    articleNo: string;
    changeType: ChangeType;
    before: string | null;
    after: string | null;
  } {
    return {
      articleNo: this.articleNo,
      changeType: this.changeType,
      before: this.before,
      after: this.after,
    };
  }
}
