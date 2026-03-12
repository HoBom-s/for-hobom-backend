import { Inject, Injectable } from "@nestjs/common";
import { FetchLawVersionUseCase } from "../../domain/ports/in/fetch-law-version.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { LawApiPort } from "../../domain/ports/out/law-api.port";
import { LawVersionPersistencePort } from "../../domain/ports/out/law-version-persistence.port";
import { LawVersionQueryPort } from "../../domain/ports/out/law-version-query.port";
import { LawDiffPersistencePort } from "../../domain/ports/out/law-diff-persistence.port";
import { LawDiffQueryPort } from "../../domain/ports/out/law-diff-query.port";
import { OutboxPersistencePort } from "../../../../hb-backend-api/outbox/domain/ports/out/outbox-persistence.port";
import { DiscordWebhookService } from "../../../../shared/discord/discord-webhook.service";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { LawArticle } from "../../domain/model/law-article.vo";
import { LawVersionEntitySchema } from "../../domain/model/law-version.entity";
import { ChangeType } from "../../domain/enums/change-type.enum";
import { CreateOutboxEntity } from "../../../../hb-backend-api/outbox/domain/model/create-outbox.entity";
import { EventType } from "../../../../hb-backend-api/outbox/domain/model/event-type.enum";
import { OutboxStatus } from "../../../../hb-backend-api/outbox/domain/model/outbox-status.enum";

@Injectable()
export class FetchLawVersionService implements FetchLawVersionUseCase {
  constructor(
    @Inject(DIToken.PrivacyLawModule.LawApiPort)
    private readonly lawApiPort: LawApiPort,
    @Inject(DIToken.PrivacyLawModule.LawVersionPersistencePort)
    private readonly lawVersionPersistencePort: LawVersionPersistencePort,
    @Inject(DIToken.PrivacyLawModule.LawVersionQueryPort)
    private readonly lawVersionQueryPort: LawVersionQueryPort,
    @Inject(DIToken.PrivacyLawModule.LawDiffPersistencePort)
    private readonly lawDiffPersistencePort: LawDiffPersistencePort,
    @Inject(DIToken.PrivacyLawModule.LawDiffQueryPort)
    private readonly lawDiffQueryPort: LawDiffQueryPort,
    @Inject(DIToken.OutboxModule.OutboxPersistencePort)
    private readonly outboxPersistencePort: OutboxPersistencePort,
    private readonly discordWebhookService: DiscordWebhookService,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(): Promise<void> {
    const lawData = await this.lawApiPort.fetchLaw();
    const latestVersion = await this.lawVersionQueryPort.findLatest();

    if (
      latestVersion != null &&
      this.isIdentical(latestVersion, lawData.articles)
    ) {
      return;
    }

    await this.lawVersionPersistencePort.save({
      lawId: lawData.lawId,
      lawName: "개인정보 보호법",
      proclamationDate: lawData.proclamationDate,
      enforcementDate: lawData.enforcementDate,
      articles: lawData.articles,
      rawXml: lawData.rawXml,
      fetchedAt: new Date(),
    });

    if (latestVersion == null) {
      return;
    }

    const changes = this.computeDiff(
      latestVersion.getArticles,
      lawData.articles,
    );
    if (changes.length === 0) {
      return;
    }

    const newVersion = await this.lawVersionQueryPort.findLatest();
    if (newVersion == null) {
      return;
    }

    await this.lawDiffPersistencePort.save({
      fromVersionId: latestVersion.getId.toString(),
      toVersionId: newVersion.getId.toString(),
      fromProclamationDate: latestVersion.getProclamationDate,
      toProclamationDate: lawData.proclamationDate,
      changes: changes.map((c) => ({
        articleNo: c.articleNo,
        changeType: c.changeType,
        before: c.before,
        after: c.after,
      })),
    });

    const diffs = await this.lawDiffQueryPort.findByVersionId(newVersion.getId);
    if (diffs.length > 0) {
      await this.outboxPersistencePort.save(
        CreateOutboxEntity.of(
          EventType.LAW_CHANGED,
          {
            diffId: diffs[0].getId.toString(),
            changes: changes.map((c) => ({
              articleNo: c.articleNo,
              changeType: c.changeType,
              before: c.before ?? "",
              after: c.after ?? "",
            })),
          },
          OutboxStatus.PENDING,
          0,
          1,
        ),
      );
    }

    await this.discordWebhookService.sendErrorMessage(
      `개인정보 보호법 개정 감지`,
      `변경 조문 ${changes.length}건이 감지되었어요.`,
    );
  }

  private isIdentical(
    latestVersion: LawVersionEntitySchema,
    newArticles: {
      articleNo: string;
      title: string;
      content: string;
      paragraphs: {
        no: string;
        content: string;
        subItems: { no: string; content: string }[];
      }[];
    }[],
  ): boolean {
    const oldArticles = latestVersion.getArticles;
    if (oldArticles.length !== newArticles.length) return false;

    for (let i = 0; i < oldArticles.length; i++) {
      const old = oldArticles[i];
      const next = newArticles[i];
      if (
        old.getArticleNo !== next.articleNo ||
        old.getContent !== next.content
      ) {
        return false;
      }
    }
    return true;
  }

  private computeDiff(
    oldArticles: LawArticle[],
    newArticles: {
      articleNo: string;
      title: string;
      content: string;
      paragraphs: {
        no: string;
        content: string;
        subItems: { no: string; content: string }[];
      }[];
    }[],
  ): {
    articleNo: string;
    changeType: ChangeType;
    before: string | null;
    after: string | null;
  }[] {
    const changes: {
      articleNo: string;
      changeType: ChangeType;
      before: string | null;
      after: string | null;
    }[] = [];

    const oldMap = new Map(oldArticles.map((a) => [a.getArticleNo, a]));
    const newMap = new Map(newArticles.map((a) => [a.articleNo, a]));

    for (const [articleNo, oldArticle] of oldMap) {
      const newArticle = newMap.get(articleNo);
      if (newArticle == null) {
        changes.push({
          articleNo,
          changeType: ChangeType.DELETED,
          before: oldArticle.getContent,
          after: null,
        });
      } else if (oldArticle.getContent !== newArticle.content) {
        changes.push({
          articleNo,
          changeType: ChangeType.MODIFIED,
          before: oldArticle.getContent,
          after: newArticle.content,
        });
      }
    }

    for (const [articleNo, newArticle] of newMap) {
      if (!oldMap.has(articleNo)) {
        changes.push({
          articleNo,
          changeType: ChangeType.ADDED,
          before: null,
          after: newArticle.content,
        });
      }
    }

    return changes;
  }
}
