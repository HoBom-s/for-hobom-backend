import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { LawApiPort } from "../../domain/ports/out/law-api.port";
import * as puppeteer from "puppeteer";
import { createPool, Pool } from "generic-pool";

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
export class LawApiAdapter implements LawApiPort, OnModuleDestroy {
  private static readonly LAW_URL = "https://www.law.go.kr/법령/개인정보보호법";

  private readonly browserPool: Pool<puppeteer.Browser> = createPool(
    {
      create: () =>
        puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
          }),
        }),
      destroy: (browser) => browser.close(),
    },
    { min: 0, max: 2 },
  );

  async onModuleDestroy(): Promise<void> {
    await this.browserPool.drain();
    await this.browserPool.clear();
  }

  public async fetchLaw(): Promise<{
    rawXml: string;
    lawId: string;
    proclamationDate: string;
    enforcementDate: string;
    articles: Article[];
  }> {
    const browser = await this.browserPool.acquire();

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      );

      // Step 1: Navigate to wrapper page to get the iframe URL (resolves lsiSeq)
      await page.goto(LawApiAdapter.LAW_URL, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      const iframeSrc = await page.evaluate(() => {
        const iframe = document.querySelector("iframe");
        return iframe ? iframe.src : null;
      });

      if (!iframeSrc?.includes("law.go.kr")) {
        throw new Error("법령 페이지에서 유효한 iframe을 찾을 수 없어요.");
      }

      // Step 2: Navigate to the actual content page
      await page.goto(iframeSrc, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });
      // Step 3: Extract metadata and articles
      const result = await page.evaluate(() => {
        const getValue = (id: string) => {
          const el = document.getElementById(id);
          return el ? (el as HTMLInputElement).value || "" : "";
        };

        const lawId = getValue("lsId");
        const proclamationDate = getValue("ancYd");
        const enforcementDate = getValue("efYd");
        const rawHtml = document.body.innerHTML;

        // Parse articles from pgroup elements
        const conScroll = document.getElementById("conScroll");
        if (!conScroll) {
          return {
            rawHtml,
            lawId,
            proclamationDate,
            enforcementDate,
            articles: [],
          };
        }

        const pgroups = conScroll.querySelectorAll(".pgroup");
        const articles: {
          articleNo: string;
          title: string;
          content: string;
          paragraphs: {
            no: string;
            content: string;
            subItems: { no: string; content: string }[];
          }[];
        }[] = [];

        let currentArticle: (typeof articles)[0] | null = null;
        let currentParagraphs: (typeof articles)[0]["paragraphs"] = [];
        let _currentSubItems: { no: string; content: string }[] = [];
        let paragraphNo = 0;

        for (const pg of pgroups) {
          const lawcon = pg.querySelector(".lawcon");
          if (!lawcon) {
            continue;
          }

          const articleEl = lawcon.querySelector("p.pty1_p4");
          if (articleEl) {
            // Save previous article
            if (currentArticle) {
              currentArticle.paragraphs = currentParagraphs;
              articles.push(currentArticle);
            }

            const label = articleEl.querySelector("span.bl label");
            const titleText = label ? (label.textContent?.trim() ?? "") : "";

            // Extract article number from title (e.g., "제1조(목적)" -> "제1조")
            const noMatch = /제[\d조의]+/.exec(titleText);
            const articleNo = noMatch ? noMatch[0] : titleText;

            // Get full text content (excluding UI elements)
            const cloned = articleEl.cloneNode(true) as HTMLElement;
            cloned
              .querySelectorAll("input, .lawico01, ul")
              .forEach((e) => e.remove());
            const fullText = cloned.textContent?.trim() ?? "";

            currentArticle = {
              articleNo,
              title: titleText,
              content: fullText,
              paragraphs: [],
            };
            currentParagraphs = [];
            _currentSubItems = [];
            paragraphNo = 0;
          }

          if (!currentArticle) {
            continue;
          }

          // Parse paragraphs (항) — pty3 class
          const paragraphEls = lawcon.querySelectorAll(
            "p.pty3, p.pty3_dep1, p.pty3_dep2",
          );
          for (const pEl of paragraphEls) {
            paragraphNo++;
            const text = pEl.textContent?.trim() ?? "";
            // Extract paragraph number (e.g., "① ..." -> "1")
            const pNoMatch = /^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]/.exec(text);
            const pNo = pNoMatch
              ? String("①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳".indexOf(pNoMatch[0]) + 1)
              : String(paragraphNo);
            currentParagraphs.push({ no: pNo, content: text, subItems: [] });
          }

          // Parse sub-items (호) — pty1_de2h class
          const subItemEls = lawcon.querySelectorAll("p.pty1_de2h");
          for (const sEl of subItemEls) {
            const text = sEl.textContent?.trim() ?? "";
            const noMatch = /^([\d의]+)\./.exec(text);
            const no = noMatch ? noMatch[1] : "";
            if (currentParagraphs.length > 0) {
              currentParagraphs[currentParagraphs.length - 1].subItems.push({
                no,
                content: text,
              });
            }
          }
        }

        // Push last article
        if (currentArticle) {
          currentArticle.paragraphs = currentParagraphs;
          articles.push(currentArticle);
        }

        return { rawHtml, lawId, proclamationDate, enforcementDate, articles };
      });

      return {
        rawXml: result.rawHtml,
        lawId: result.lawId,
        proclamationDate: result.proclamationDate,
        enforcementDate: result.enforcementDate,
        articles: result.articles,
      };
    } finally {
      await this.browserPool.release(browser);
    }
  }
}
