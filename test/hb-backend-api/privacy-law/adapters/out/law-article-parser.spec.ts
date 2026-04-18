import {
  parseLawPgroups,
  RawPgroupData,
} from "src/hb-backend-api/privacy-law/adapters/out/law-article-parser";

describe("parseLawPgroups", () => {
  it("should nest sub-items under the correct paragraph (not the last one)", () => {
    // 제9조(기본계획) 실제 구조 재현:
    // ① 보호위원회는...기본계획을 수립한다.
    // ② 기본계획에는 다음 각 호의 사항이 포함되어야 한다.
    //   1. 개인정보 보호의 기본목표와 추진방향
    //   2. 개인정보 보호와 관련된 제도 및 법령의 개선
    //   3. 개인정보 침해 방지를 위한 대책
    // ③ 국회, 법원, 헌법재판소...
    const pgroups: RawPgroupData[] = [
      {
        article: {
          articleNo: "제9조",
          title: "제9조(기본계획)",
          content: "제9조(기본계획)",
        },
        elements: [
          {
            type: "paragraph",
            text: "① 보호위원회는 개인정보의 보호와 정보주체의 권익 보장을 위하여 3년마다 개인정보 보호 기본계획을 수립한다.",
          },
          {
            type: "paragraph",
            text: "② 기본계획에는 다음 각 호의 사항이 포함되어야 한다.",
          },
          {
            type: "subItem",
            text: "1. 개인정보 보호의 기본목표와 추진방향",
          },
          {
            type: "subItem",
            text: "2. 개인정보 보호와 관련된 제도 및 법령의 개선",
          },
          {
            type: "subItem",
            text: "3. 개인정보 침해 방지를 위한 대책",
          },
          {
            type: "paragraph",
            text: "③ 국회, 법원, 헌법재판소, 중앙선거관리위원회는 해당 기관의 개인정보 보호를 위한 기본계획을 수립·시행할 수 있다.",
          },
        ],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result).toHaveLength(1);
    const article = result[0];
    expect(article.articleNo).toBe("제9조");
    expect(article.paragraphs).toHaveLength(3);

    // ① — subItems 없음
    expect(article.paragraphs[0].no).toBe("1");
    expect(article.paragraphs[0].subItems).toHaveLength(0);

    // ② — 1~3호가 여기에 있어야 함
    expect(article.paragraphs[1].no).toBe("2");
    expect(article.paragraphs[1].subItems).toHaveLength(3);
    expect(article.paragraphs[1].subItems[0].no).toBe("1");
    expect(article.paragraphs[1].subItems[1].no).toBe("2");
    expect(article.paragraphs[1].subItems[2].no).toBe("3");

    // ③ — subItems 없음
    expect(article.paragraphs[2].no).toBe("3");
    expect(article.paragraphs[2].subItems).toHaveLength(0);
  });

  it("should handle article with no paragraphs", () => {
    const pgroups: RawPgroupData[] = [
      {
        article: {
          articleNo: "제1조",
          title: "제1조(목적)",
          content: "이 법은 개인정보의 처리에 관한 사항을 정한다.",
        },
        elements: [],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result).toHaveLength(1);
    expect(result[0].paragraphs).toHaveLength(0);
  });

  it("should handle multiple articles across pgroups", () => {
    const pgroups: RawPgroupData[] = [
      {
        article: {
          articleNo: "제1조",
          title: "제1조(목적)",
          content: "이 법은 목적을 정한다.",
        },
        elements: [{ type: "paragraph", text: "① 첫번째 항" }],
      },
      {
        article: {
          articleNo: "제2조",
          title: "제2조(정의)",
          content: "이 법에서 사용하는 용어의 뜻은 다음과 같다.",
        },
        elements: [
          { type: "paragraph", text: "① 정의 항" },
          { type: "subItem", text: "1. 첫번째 호" },
        ],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result).toHaveLength(2);

    expect(result[0].articleNo).toBe("제1조");
    expect(result[0].paragraphs).toHaveLength(1);
    expect(result[0].paragraphs[0].subItems).toHaveLength(0);

    expect(result[1].articleNo).toBe("제2조");
    expect(result[1].paragraphs).toHaveLength(1);
    expect(result[1].paragraphs[0].subItems).toHaveLength(1);
  });

  it("should skip pgroups before the first article", () => {
    const pgroups: RawPgroupData[] = [
      {
        elements: [{ type: "paragraph", text: "① 소속 없는 항" }],
      },
      {
        article: {
          articleNo: "제1조",
          title: "제1조(목적)",
          content: "목적",
        },
        elements: [],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result).toHaveLength(1);
    expect(result[0].paragraphs).toHaveLength(0);
  });

  it("should skip empty text elements", () => {
    const pgroups: RawPgroupData[] = [
      {
        article: {
          articleNo: "제1조",
          title: "제1조(목적)",
          content: "목적",
        },
        elements: [
          { type: "paragraph", text: "" },
          { type: "paragraph", text: "① 실제 항" },
          { type: "subItem", text: "" },
          { type: "subItem", text: "1. 실제 호" },
        ],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result[0].paragraphs).toHaveLength(1);
    expect(result[0].paragraphs[0].subItems).toHaveLength(1);
  });

  it("should assign fallback paragraph number when no circled numeral", () => {
    const pgroups: RawPgroupData[] = [
      {
        article: {
          articleNo: "제1조",
          title: "제1조(목적)",
          content: "목적",
        },
        elements: [
          { type: "paragraph", text: "원문 번호 없는 항" },
          { type: "paragraph", text: "두번째 번호 없는 항" },
        ],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result[0].paragraphs[0].no).toBe("1");
    expect(result[0].paragraphs[1].no).toBe("2");
  });

  it("should drop sub-items that appear before any paragraph", () => {
    const pgroups: RawPgroupData[] = [
      {
        article: {
          articleNo: "제1조",
          title: "제1조(목적)",
          content: "목적",
        },
        elements: [
          { type: "subItem", text: "1. 부모 항 없는 호" },
          { type: "paragraph", text: "① 첫번째 항" },
        ],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result[0].paragraphs).toHaveLength(1);
    expect(result[0].paragraphs[0].subItems).toHaveLength(0);
  });

  it("should extract sub-item number with 의 (e.g., 1의2.)", () => {
    const pgroups: RawPgroupData[] = [
      {
        article: {
          articleNo: "제1조",
          title: "제1조(목적)",
          content: "목적",
        },
        elements: [
          { type: "paragraph", text: "① 항" },
          { type: "subItem", text: "1의2. 특수 번호 호" },
        ],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result[0].paragraphs[0].subItems[0].no).toBe("1의2");
  });

  it("should handle elements spanning multiple pgroups for the same article", () => {
    // 법령 HTML에서 하나의 조문이 여러 pgroup에 걸칠 수 있음
    const pgroups: RawPgroupData[] = [
      {
        article: {
          articleNo: "제9조",
          title: "제9조(기본계획)",
          content: "기본계획",
        },
        elements: [{ type: "paragraph", text: "① 첫번째 항" }],
      },
      {
        // article 없음 — 같은 조문의 연속
        elements: [
          { type: "paragraph", text: "② 두번째 항" },
          { type: "subItem", text: "1. 호" },
        ],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result).toHaveLength(1);
    expect(result[0].paragraphs).toHaveLength(2);
    expect(result[0].paragraphs[1].subItems).toHaveLength(1);
  });

  it("should return empty array for empty pgroups", () => {
    expect(parseLawPgroups([])).toEqual([]);
  });
});
