import { Injectable } from "@nestjs/common";

@Injectable()
export class DiscordWebhookService {
  private readonly webhookUrl = process.env.HOBOM_DISCORED_WEBHOOK_URL;

  public async sendErrorMessage(title: string, description: string) {
    if (!this.webhookUrl) return;

    await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title,
            description,
            color: 0xff0000,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  }
}
