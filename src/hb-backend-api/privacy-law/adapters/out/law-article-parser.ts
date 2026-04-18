export interface RawLawElement {
  type: "paragraph" | "subItem";
  text: string;
}

export interface RawPgroupData {
  article?: {
    articleNo: string;
    title: string;
    content: string;
  };
  elements: RawLawElement[];
}

export interface ParsedArticle {
  articleNo: string;
  title: string;
  content: string;
  paragraphs: {
    no: string;
    content: string;
    subItems: { no: string; content: string }[];
  }[];
}

const CIRCLED_NUMBERS = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";
const CIRCLED_REGEX = new RegExp(`^[${CIRCLED_NUMBERS}]`);

export function parseLawPgroups(pgroups: RawPgroupData[]): ParsedArticle[] {
  const articles: ParsedArticle[] = [];

  let currentArticle: ParsedArticle | null = null;
  let currentParagraphs: ParsedArticle["paragraphs"] = [];
  let paragraphNo = 0;

  for (const pg of pgroups) {
    if (pg.article) {
      if (currentArticle) {
        currentArticle.paragraphs = currentParagraphs;
        articles.push(currentArticle);
      }

      // ①이 조문 헤더(p.pty1_p4)에 포함된 경우 암시적 항으로 추출
      const circledIdx = pg.article.content.indexOf("①");
      if (circledIdx !== -1) {
        const paragraphText = pg.article.content.slice(circledIdx).trim();
        currentArticle = {
          articleNo: pg.article.articleNo,
          title: pg.article.title,
          content: pg.article.content.slice(0, circledIdx).trim(),
          paragraphs: [],
        };
        currentParagraphs = [{ no: "1", content: paragraphText, subItems: [] }];
        paragraphNo = 1;
      } else {
        currentArticle = {
          ...pg.article,
          paragraphs: [],
        };
        currentParagraphs = [];
        paragraphNo = 0;
      }
    }

    if (!currentArticle) {
      continue;
    }

    for (const el of pg.elements) {
      if (!el.text) {
        continue;
      }

      if (el.type === "paragraph") {
        paragraphNo++;
        const pNoMatch = CIRCLED_REGEX.exec(el.text);
        const pNo = pNoMatch
          ? String(CIRCLED_NUMBERS.indexOf(pNoMatch[0]) + 1)
          : String(paragraphNo);
        currentParagraphs.push({ no: pNo, content: el.text, subItems: [] });
      } else {
        const noMatch = /^([\d의]+)\./.exec(el.text);
        const no = noMatch ? noMatch[1] : "";
        if (currentParagraphs.length > 0) {
          currentParagraphs[currentParagraphs.length - 1].subItems.push({
            no,
            content: el.text,
          });
        }
      }
    }
  }

  if (currentArticle) {
    currentArticle.paragraphs = currentParagraphs;
    articles.push(currentArticle);
  }

  return articles;
}
