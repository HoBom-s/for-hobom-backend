import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { LawApiPort } from "../../domain/ports/out/law-api.port";
import * as puppeteer from "puppeteer";
import { createPool, Pool } from "generic-pool";
import {
  parseLawPgroups,
  ParsedArticle,
  RawPgroupData,
} from "./law-article-parser";

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
    articles: ParsedArticle[];
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

      // Step 3: Extract raw data from DOM
      const result = await page.evaluate(() => {
        const getValue = (id: string) => {
          const el = document.getElementById(id);
          return el ? (el as HTMLInputElement).value || "" : "";
        };

        const lawId = getValue("lsId");
        const proclamationDate = getValue("ancYd");
        const enforcementDate = getValue("efYd");
        const rawHtml = document.body.innerHTML;

        const conScroll = document.getElementById("conScroll");
        if (!conScroll) {
          return {
            rawHtml,
            lawId,
            proclamationDate,
            enforcementDate,
            pgroups: [] as {
              article?: { articleNo: string; title: string; content: string };
              elements: { type: "paragraph" | "subItem"; text: string }[];
            }[],
          };
        }

        const pgroupEls = conScroll.querySelectorAll(".pgroup");
        const pgroups: {
          article?: { articleNo: string; title: string; content: string };
          elements: { type: "paragraph" | "subItem"; text: string }[];
        }[] = [];

        for (const pg of pgroupEls) {
          const lawcon = pg.querySelector(".lawcon");
          if (!lawcon) {
            continue;
          }

          let article:
            | { articleNo: string; title: string; content: string }
            | undefined;

          const articleEl = lawcon.querySelector("p.pty1_p4");
          if (articleEl) {
            const label = articleEl.querySelector("span.bl label");
            const titleText = label ? (label.textContent?.trim() ?? "") : "";

            const noMatch = /제[\d조의]+/.exec(titleText);
            const articleNo = noMatch ? noMatch[0] : titleText;

            const cloned = articleEl.cloneNode(true) as HTMLElement;
            cloned
              .querySelectorAll("input, .lawico01, ul")
              .forEach((e) => e.remove());
            const fullText = cloned.textContent?.trim() ?? "";

            article = { articleNo, title: titleText, content: fullText };
          }

          const elements: { type: "paragraph" | "subItem"; text: string }[] =
            [];
          const els = lawcon.querySelectorAll("p.pty1_de2_1, p.pty1_de2h");
          for (const el of els) {
            const text = el.textContent?.trim() ?? "";
            elements.push({
              type: el.classList.contains("pty1_de2_1")
                ? "paragraph"
                : "subItem",
              text,
            });
          }

          pgroups.push({ article, elements });
        }

        return { rawHtml, lawId, proclamationDate, enforcementDate, pgroups };
      });

      // Step 4: Structure articles from raw pgroup data
      const articles = parseLawPgroups(
        result.pgroups as RawPgroupData[],
      );

      return {
        rawXml: result.rawHtml,
        lawId: result.lawId,
        proclamationDate: result.proclamationDate,
        enforcementDate: result.enforcementDate,
        articles,
      };
    } finally {
      await this.browserPool.release(browser);
    }
  }
}
