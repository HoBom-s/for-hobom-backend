import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LawApiPort } from "../../domain/ports/out/law-api.port";

interface Article {
  articleNo: string;
  title: string;
  content: string;
  paragraphs: {
    no: string;
    content: string;
    subItems: { no: string; content: string }[];
  }[];
}

@Injectable()
export class LawApiAdapter implements LawApiPort {
  private static readonly API_URL =
    "https://www.law.go.kr/DRF/lawService.do";

  constructor(private readonly configService: ConfigService) {}

  public async fetchLaw(lawName: string): Promise<{
    rawXml: string;
    lawId: string;
    proclamationDate: string;
    enforcementDate: string;
    articles: Article[];
  }> {
    const oc = this.configService.getOrThrow<string>("HOBOM_LAW_API_OC");
    const url = new URL(LawApiAdapter.API_URL);
    url.searchParams.set("OC", oc);
    url.searchParams.set("target", "law");
    url.searchParams.set("type", "XML");
    url.searchParams.set("query", lawName);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(
        `법령 API 호출에 실패했어요. status=${response.status}`,
      );
    }

    const rawXml = await response.text();
    return this.parseXml(rawXml);
  }

  private parseXml(xml: string): {
    rawXml: string;
    lawId: string;
    proclamationDate: string;
    enforcementDate: string;
    articles: Article[];
  } {
    const lawId = this.extractTag(xml, "법령ID");
    const proclamationDate = this.extractTag(xml, "공포일자");
    const enforcementDate = this.extractTag(xml, "시행일자");
    const articles = this.parseArticles(xml);

    return { rawXml: xml, lawId, proclamationDate, enforcementDate, articles };
  }

  private extractTag(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}>([^<]*)</${tagName}>`);
    const match = xml.match(regex);
    return match?.[1] ?? "";
  }

  private parseArticles(xml: string): Article[] {
    const articles: Article[] = [];
    const articleRegex = /<조문단위>([\s\S]*?)<\/조문단위>/g;
    let match: RegExpExecArray | null;
    while ((match = articleRegex.exec(xml)) != null) {
      const block = match[1];
      const articleNo = this.extractTag(block, "조문번호");
      const title = this.extractTag(block, "조문제목");
      const content = this.extractTag(block, "조문내용");
      const paragraphs = this.parseParagraphs(block);

      articles.push({
        articleNo: articleNo.trim(),
        title: title.trim(),
        content: content.trim(),
        paragraphs,
      });
    }
    return articles;
  }

  private parseParagraphs(
    block: string,
  ): { no: string; content: string; subItems: { no: string; content: string }[] }[] {
    const paragraphs: {
      no: string;
      content: string;
      subItems: { no: string; content: string }[];
    }[] = [];
    const paraRegex = /<항>([\s\S]*?)<\/항>/g;
    let match: RegExpExecArray | null;
    while ((match = paraRegex.exec(block)) != null) {
      const paraBlock = match[1];
      const no = this.extractTag(paraBlock, "항번호");
      const content = this.extractTag(paraBlock, "항내용");
      const subItems = this.parseSubItems(paraBlock);

      paragraphs.push({
        no: no.trim(),
        content: content.trim(),
        subItems,
      });
    }
    return paragraphs;
  }

  private parseSubItems(
    paraBlock: string,
  ): { no: string; content: string }[] {
    const subItems: { no: string; content: string }[] = [];
    const subItemRegex = /<호>([\s\S]*?)<\/호>/g;
    let match: RegExpExecArray | null;
    while ((match = subItemRegex.exec(paraBlock)) != null) {
      const subBlock = match[1];
      const no = this.extractTag(subBlock, "호번호");
      const content = this.extractTag(subBlock, "호내용");

      subItems.push({ no: no.trim(), content: content.trim() });
    }
    return subItems;
  }
}
