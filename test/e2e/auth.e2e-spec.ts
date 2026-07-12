import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import * as cookieParser from "cookie-parser";
import { Model } from "mongoose";
import { AuthModule } from "../../src/hb-backend-api/auth/auth.module";
import { TransactionModule } from "../../src/infra/mongo/transaction/transaction.module";
import { TransactionRunner } from "../../src/infra/mongo/transaction/transaction.runner";
import { ResponseWrapInterceptor } from "../../src/shared/adapters/in/rest/interceptors/wrapped-response.interceptor";
import { UserEntity } from "../../src/hb-backend-api/user/domain/model/user.entity";
import { UserDocument } from "../../src/hb-backend-api/user/domain/model/user.schema";

const API = "hobom-system-backend/api/v1/auth";

const TEST_USER = {
  username: "testuser",
  nickname: "testnick",
  email: "test@test.com",
  password: "Test1234!@#",
  friends: [],
  approvalStatus: "APPROVED",
  isAdmin: false,
};

function parseCookies(res: request.Response): Record<string, string> {
  const raw = res.headers["set-cookie"] as unknown as string[] | undefined;
  if (!raw) {
    return {};
  }

  const cookies: Record<string, string> = {};
  for (const cookie of raw) {
    const [pair] = cookie.split(";");
    const [name, ...rest] = pair.split("=");
    cookies[name.trim()] = rest.join("=").trim();
  }
  return cookies;
}

describe("Auth (e2e)", () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    process.env.HOBOM_JWT_SECRET = "e2e-test-secret";
    process.env.HOBOM_JWT_REFRESH_SECRET = "e2e-test-refresh-secret";
    process.env.HOBOM_JWT_ACCESS_TOKEN_EXPIRED = "15m";
    process.env.HOBOM_JWT_REFRESH_TOKEN_EXPIRED = "30d";
    process.env.HOBOM_GEN_SALT = "4";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongod.getUri()),
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),
        TransactionModule,
        AuthModule,
      ],
    })
      .overrideProvider(TransactionRunner)
      .useValue({ run: (fn: () => Promise<unknown>) => fn() })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseWrapInterceptor());
    await app.init();

    const userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(UserEntity.name),
    );
    await userModel.create(TEST_USER);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  /** 로그인 후 쿠키 반환 헬퍼 */
  async function login(): Promise<Record<string, string>> {
    const res = await request(app.getHttpServer())
      .post(`/${API}/login`)
      .send({ nickname: TEST_USER.nickname, password: TEST_USER.password })
      .expect(201);
    return parseCookies(res);
  }

  // ── POST /auth/login ─────────────────────────────────────────────

  describe("POST /auth/login", () => {
    it("올바른 credentials → 201 + accessToken/refreshToken 쿠키", async () => {
      const cookies = await login();

      expect(cookies.accessToken).toBeDefined();
      expect(cookies.refreshToken).toBeDefined();
      expect(cookies.accessToken.split(".")).toHaveLength(3);
      expect(cookies.refreshToken.split(".")).toHaveLength(3);
    });

    it("잘못된 비밀번호 → 400", async () => {
      await request(app.getHttpServer())
        .post(`/${API}/login`)
        .send({ nickname: TEST_USER.nickname, password: "WrongPass1!@" })
        .expect(400);
    });

    it("존재하지 않는 유저 → 404", async () => {
      await request(app.getHttpServer())
        .post(`/${API}/login`)
        .send({ nickname: "nonexistent", password: "Test1234!@#" })
        .expect(404);
    });

    it("비밀번호 유효성 검증 실패 (8자 미만) → 400", async () => {
      await request(app.getHttpServer())
        .post(`/${API}/login`)
        .send({ nickname: TEST_USER.nickname, password: "Ab1!" })
        .expect(400);
    });

    it("닉네임 누락 → 400", async () => {
      await request(app.getHttpServer())
        .post(`/${API}/login`)
        .send({ password: TEST_USER.password })
        .expect(400);
    });
  });

  // ── GET /auth/me ──────────────────────────────────────────────────

  describe("GET /auth/me", () => {
    it("유효한 토큰으로 내 정보 조회 → 200 + nickname", async () => {
      const cookies = await login();

      const meRes = await request(app.getHttpServer())
        .get(`/${API}/me`)
        .set("Cookie", [`accessToken=${cookies.accessToken}`])
        .expect(200);

      expect(meRes.body.items.nickname).toBe(TEST_USER.nickname);
      expect(meRes.body.items.username).toBe(TEST_USER.username);
      expect(meRes.body.items.email).toBe(TEST_USER.email);
    });

    it("토큰 없이 → 401", async () => {
      await request(app.getHttpServer()).get(`/${API}/me`).expect(401);
    });
  });

  // ── POST /auth/refresh ────────────────────────────────────────────

  describe("POST /auth/refresh", () => {
    it("refreshToken 쿠키로 토큰 갱신 → 새 accessToken 쿠키", async () => {
      const loginCookies = await login();

      const refreshRes = await request(app.getHttpServer())
        .post(`/${API}/refresh`)
        .set("Cookie", [`refreshToken=${loginCookies.refreshToken}`])
        .expect(201);

      const refreshCookies = parseCookies(refreshRes);
      expect(refreshCookies.accessToken).toBeDefined();
      expect(refreshCookies.accessToken.split(".")).toHaveLength(3);
    });

    it("refreshToken 없이 → 401", async () => {
      await request(app.getHttpServer()).post(`/${API}/refresh`).expect(401);
    });
  });

  // ── POST /auth/logout ─────────────────────────────────────────────

  describe("POST /auth/logout", () => {
    it("로그아웃 → 쿠키 제거", async () => {
      const loginCookies = await login();

      const logoutRes = await request(app.getHttpServer())
        .post(`/${API}/logout`)
        .set("Cookie", [`refreshToken=${loginCookies.refreshToken}`])
        .expect(201);

      const rawCookies = logoutRes.headers["set-cookie"] as unknown as string[];
      const accessCookie = rawCookies.find((c: string) =>
        c.startsWith("accessToken="),
      );
      const refreshCookie = rawCookies.find((c: string) =>
        c.startsWith("refreshToken="),
      );
      expect(accessCookie).toBeDefined();
      expect(refreshCookie).toBeDefined();

      const logoutCookies = parseCookies(logoutRes);
      expect(logoutCookies.accessToken).toBe("");
      expect(logoutCookies.refreshToken).toBe("");
    });

    it("로그아웃 후 기존 refreshToken으로 갱신 불가 → 401", async () => {
      const loginCookies = await login();
      const refreshToken = loginCookies.refreshToken;

      await request(app.getHttpServer())
        .post(`/${API}/logout`)
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(201);

      await request(app.getHttpServer())
        .post(`/${API}/refresh`)
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(401);
    });
  });
});
