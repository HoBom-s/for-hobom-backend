import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { JwtService } from "@nestjs/jwt";
import * as cookieParser from "cookie-parser";
import { Model, Types } from "mongoose";
import { LabelModule } from "../../src/hb-backend-api/label/label.module";
import { AuthModule } from "../../src/hb-backend-api/auth/auth.module";
import { TransactionModule } from "../../src/infra/mongo/transaction/transaction.module";
import { TransactionRunner } from "../../src/infra/mongo/transaction/transaction.runner";
import { ResponseWrapInterceptor } from "../../src/shared/adapters/in/rest/interceptors/wrapped-response.interceptor";
import { UserEntity } from "../../src/hb-backend-api/user/domain/model/user.entity";
import { UserDocument } from "../../src/hb-backend-api/user/domain/model/user.schema";

const API = "hobom-system-backend/api/v1/labels";

describe("Label CRUD (e2e)", () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let userId: Types.ObjectId;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    process.env.HOBOM_JWT_SECRET = "e2e-test-secret";
    process.env.HOBOM_GEN_SALT = "4";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongod.getUri()),
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),
        TransactionModule,
        AuthModule,
        LabelModule,
      ],
    })
      .overrideProvider(TransactionRunner)
      .useValue({ run: (fn: () => Promise<unknown>) => fn() })
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

    // 테스트 유저 직접 생성
    const userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(UserEntity.name),
    );
    userId = new Types.ObjectId();
    await userModel.create({
      _id: userId,
      username: "testuser",
      nickname: "testnick",
      email: "test@test.com",
      password: "Test1234!@#",
      friends: [],
      approvalStatus: "APPROVED",
      isAdmin: false,
    });

    // JWT 토큰 발급
    const jwtService = moduleFixture.get(JwtService);
    accessToken = jwtService.sign(
      { sub: "testnick", nickname: "testnick" },
      { expiresIn: "15m" },
    );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  const authed = (req: request.Test) =>
    req.set("Cookie", [`accessToken=${accessToken}`]);

  let labelId: string;

  it("POST /labels — 라벨 생성", async () => {
    const res = await authed(
      request(app.getHttpServer()).post(`/${API}`).send({ title: "버그" }),
    ).expect(201);

    expect(res.body.success).toBe(true);
  });

  it("GET /labels — 목록 조회 (1건)", async () => {
    const res = await authed(
      request(app.getHttpServer()).get(`/${API}`),
    ).expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].title).toBe("버그");
    expect(res.body.items[0].ownerId).toBe(userId.toHexString());
    labelId = res.body.items[0].id;
  });

  it("GET /labels/:id — 단건 조회", async () => {
    const res = await authed(
      request(app.getHttpServer()).get(`/${API}/${labelId}`),
    ).expect(200);

    expect(res.body.items.title).toBe("버그");
  });

  it("PATCH /labels/:id — 제목 수정", async () => {
    await authed(
      request(app.getHttpServer())
        .patch(`/${API}/${labelId}`)
        .send({ title: "기능" }),
    ).expect(200);

    const res = await authed(
      request(app.getHttpServer()).get(`/${API}/${labelId}`),
    ).expect(200);

    expect(res.body.items.title).toBe("기능");
  });

  it("POST /labels — 중복 제목 시 400", async () => {
    await authed(
      request(app.getHttpServer()).post(`/${API}`).send({ title: "기능" }),
    ).expect(400);
  });

  it("POST /labels — 빈 제목 시 400", async () => {
    await authed(
      request(app.getHttpServer()).post(`/${API}`).send({ title: "" }),
    ).expect(400);
  });

  it("DELETE /labels/:id — 삭제 후 목록 비어있음", async () => {
    await authed(
      request(app.getHttpServer()).delete(`/${API}/${labelId}`),
    ).expect(200);

    const res = await authed(
      request(app.getHttpServer()).get(`/${API}`),
    ).expect(200);

    expect(res.body.items).toHaveLength(0);
  });

  it("인증 없이 요청 시 401", async () => {
    await request(app.getHttpServer()).get(`/${API}`).expect(401);
  });
});
