import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { DiscordWebhookService } from "src/shared/discord/discord-webhook.service";

describe("DiscordWebhookService", () => {
  const WEBHOOK_URL = "https://discord.com/api/webhooks/test";

  let service: DiscordWebhookService;
  let mockFetch: jest.Mock;

  beforeEach(async () => {
    mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const module = await Test.createTestingModule({
      providers: [
        DiscordWebhookService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(WEBHOOK_URL),
          },
        },
      ],
    }).compile();
    service = module.get(DiscordWebhookService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should send a POST request with embed payload", async () => {
    await service.sendErrorMessage("Error Title", "Error Description");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.any(String),
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body) as {
      embeds: {
        title: string;
        description: string;
        color: number;
        timestamp: string;
      }[];
    };
    expect(body.embeds).toHaveLength(1);
    expect(body.embeds[0].title).toBe("Error Title");
    expect(body.embeds[0].description).toBe("Error Description");
    expect(body.embeds[0].color).toBe(0xff0000);
    expect(body.embeds[0].timestamp).toBeDefined();
  });

  it("should not call fetch when webhook URL is undefined", async () => {
    const module = await Test.createTestingModule({
      providers: [
        DiscordWebhookService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();
    const serviceWithoutUrl = module.get(DiscordWebhookService);

    await serviceWithoutUrl.sendErrorMessage("Title", "Description");

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
