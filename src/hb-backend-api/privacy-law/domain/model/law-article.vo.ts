export class LawArticle {
  constructor(
    private readonly articleNo: string,
    private readonly title: string,
    private readonly content: string,
    private readonly paragraphs: {
      no: string;
      content: string;
      subItems: { no: string; content: string }[];
    }[],
  ) {
    Object.freeze(this);
  }

  public static of(
    articleNo: string,
    title: string,
    content: string,
    paragraphs: {
      no: string;
      content: string;
      subItems: { no: string; content: string }[];
    }[],
  ): LawArticle {
    return new LawArticle(articleNo, title, content, paragraphs);
  }

  public get getArticleNo(): string {
    return this.articleNo;
  }

  public get getTitle(): string {
    return this.title;
  }

  public get getContent(): string {
    return this.content;
  }

  public get getParagraphs(): {
    no: string;
    content: string;
    subItems: { no: string; content: string }[];
  }[] {
    return this.paragraphs;
  }

  public toPlain(): {
    articleNo: string;
    title: string;
    content: string;
    paragraphs: {
      no: string;
      content: string;
      subItems: { no: string; content: string }[];
    }[];
  } {
    return {
      articleNo: this.articleNo,
      title: this.title,
      content: this.content,
      paragraphs: this.paragraphs,
    };
  }
}
