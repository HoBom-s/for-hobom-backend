import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongooseModule } from "@nestjs/mongoose";
import { HealthModule } from "../../src/hb-backend-api/health/health.module";

describe("Health (e2e)", () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongod.getUri()), HealthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe("GET /health/live", () => {
    it("200 OK를 반환한다", () => {
      return request(app.getHttpServer())
        .get("/health/live")
        .expect(200)
        .expect("OK");
    });
  });

  describe("GET /health/ready", () => {
    it("실제 MongoDB ping 포함 health check를 반환한다", () => {
      return request(app.getHttpServer())
        .get("/health/ready")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("status", "ok");
          expect(res.body.details).toHaveProperty("mongodb");
          expect(res.body.details.mongodb).toHaveProperty("status", "up");
        });
    });
  });
});
