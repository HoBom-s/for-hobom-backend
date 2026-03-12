export interface LawVersionPersistencePort {
  save(data: {
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
  }): Promise<void>;
}
