export interface LawApiPort {
  fetchLaw(): Promise<{
    rawXml: string;
    lawId: string;
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
  }>;
}
