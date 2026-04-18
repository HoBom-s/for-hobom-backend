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

  it("should extract implicit ① paragraph from article header (real DOM structure)", () => {
    // law.go.kr 실제 DOM: ①이 p.pty1_p4 (조문 헤더)에 포함됨
    // 제20조 실제 구조 재현
    const pgroups: RawPgroupData[] = [
      {
        article: {
          articleNo: "제20조",
          title: "제20조(정보주체 이외로부터 수집한 개인정보의 수집 출처 등 통지)",
          content:
            "제20조(정보주체 이외로부터 수집한 개인정보의 수집 출처 등 통지)   ① 개인정보처리자가 정보주체 이외로부터 수집한 개인정보를 처리하는 때에는 정보주체의 요구가 있으면 즉시 다음 각 호의 모든 사항을 정보주체에게 알려야 한다.",
        },
        elements: [
          { type: "subItem", text: "1. 개인정보의 수집 출처" },
          { type: "subItem", text: "2. 개인정보의 처리 목적" },
          {
            type: "subItem",
            text: "3. 제37조에 따른 개인정보 처리의 정지를 요구하거나 동의를 철회할 권리가 있다는 사실",
          },
          {
            type: "paragraph",
            text: "② 제1항에도 불구하고 처리하는 개인정보의 종류ㆍ규모, 종업원 수 및 매출액 규모 등을 고려하여 대통령령으로 정하는 기준에 해당하는 개인정보처리자가 제17조제1항제1호에 따라 정보주체 이외로부터 개인정보를 수집하여 처리하는 때에는 제1항 각 호의 모든 사항을 정보주체에게 알려야 한다.",
          },
          {
            type: "paragraph",
            text: "③ 제2항 본문에 따라 알리는 경우 정보주체에게 알리는 시기ㆍ방법 및 절차 등 필요한 사항은 대통령령으로 정한다.",
          },
          {
            type: "paragraph",
            text: "④ 제1항과 제2항 본문은 다음 각 호의 어느 하나에 해당하는 경우에는 적용하지 아니한다.",
          },
          {
            type: "subItem",
            text: "1. 통지를 요구하는 대상이 되는 개인정보가 제32조제2항 각 호의 어느 하나에 해당하는 개인정보파일에 포함되어 있는 경우",
          },
          {
            type: "subItem",
            text: "2. 통지로 인하여 다른 사람의 생명ㆍ신체를 해할 우려가 있거나 다른 사람의 재산과 그 밖의 이익을 부당하게 침해할 우려가 있는 경우",
          },
        ],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result).toHaveLength(1);
    const art = result[0];
    expect(art.paragraphs).toHaveLength(4);

    // ① — content에서 추출된 암시적 항, 3개 호
    expect(art.paragraphs[0].no).toBe("1");
    expect(art.paragraphs[0].content).toContain("① 개인정보처리자가");
    expect(art.paragraphs[0].subItems).toHaveLength(3);
    expect(art.paragraphs[0].subItems[0].no).toBe("1");
    expect(art.paragraphs[0].subItems[1].no).toBe("2");
    expect(art.paragraphs[0].subItems[2].no).toBe("3");

    // ② — 호 없음
    expect(art.paragraphs[1].no).toBe("2");
    expect(art.paragraphs[1].subItems).toHaveLength(0);

    // ③ — 호 없음
    expect(art.paragraphs[2].no).toBe("3");
    expect(art.paragraphs[2].subItems).toHaveLength(0);

    // ④ — 2개 호
    expect(art.paragraphs[3].no).toBe("4");
    expect(art.paragraphs[3].subItems).toHaveLength(2);

    // article content에서 ① 이전 부분만 남아야 함
    expect(art.content).not.toContain("①");
  });

  it("should not create implicit paragraph when content has no ①", () => {
    const pgroups: RawPgroupData[] = [
      {
        article: {
          articleNo: "제1조",
          title: "제1조(목적)",
          content:
            "제1조(목적) 이 법은 개인정보의 처리 및 보호에 관한 사항을 정한다.",
        },
        elements: [],
      },
    ];

    const result = parseLawPgroups(pgroups);

    expect(result).toHaveLength(1);
    expect(result[0].paragraphs).toHaveLength(0);
    expect(result[0].content).toContain("이 법은");
  });

  it("should return empty array for empty pgroups", () => {
    expect(parseLawPgroups([])).toEqual([]);
  });
});
