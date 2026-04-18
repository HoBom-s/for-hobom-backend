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

/**
 * 호(sub-item)를 붙일 항(paragraph)을 결정한다.
 * - 마지막 항이 "다음 각 호"를 포함하면 그대로 사용 (인터리빙 DOM)
 * - 아니면 역순 탐색하여 "다음 각 호"를 가진 항에 붙임 (끝에 몰린 DOM)
 * - 둘 다 없으면 마지막 항에 폴백
 */
function findSubItemTarget(paragraphs: ParsedArticle["paragraphs"]): number {
  const last = paragraphs.length - 1;
  if (paragraphs[last].content.includes("다음 각 호")) {
    return last;
  }
  for (let i = last - 1; i >= 0; i--) {
    if (paragraphs[i].content.includes("다음 각 호")) {
      return i;
    }
  }
  return last;
}

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
          const targetIdx = findSubItemTarget(currentParagraphs);
          currentParagraphs[targetIdx].subItems.push({
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
