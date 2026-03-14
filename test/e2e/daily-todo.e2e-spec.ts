import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { JwtService } from "@nestjs/jwt";
import * as cookieParser from "cookie-parser";
import { Model, Types } from "mongoose";
import { CategoryModule } from "../../src/hb-backend-api/category/category.module";
import { DailyTodoModule } from "../../src/hb-backend-api/daily-todo/daily-todo.module";
import { AuthModule } from "../../src/hb-backend-api/auth/auth.module";
import { TransactionModule } from "../../src/infra/mongo/transaction/transaction.module";
import { TransactionRunner } from "../../src/infra/mongo/transaction/transaction.runner";
import { ResponseWrapInterceptor } from "../../src/shared/adapters/in/rest/interceptors/wrapped-response.interceptor";
import { UserEntity } from "../../src/hb-backend-api/user/domain/model/user.entity";
import { UserDocument } from "../../src/hb-backend-api/user/domain/model/user.schema";
import { CategoryEntity } from "../../src/hb-backend-api/category/domain/model/category.entity";
import { CategoryDocument } from "../../src/hb-backend-api/category/domain/model/category.schema";

const API = "hobom-system-backend/api/v1/daily-todos";

describe("DailyTodo CRUD (e2e)", () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let userId: Types.ObjectId;
  let categoryId: Types.ObjectId;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    process.env.HOBOM_JWT_SECRET = "e2e-test-secret";
    process.env.HOBOM_GEN_SALT = "4";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongod.getUri()),
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),
        ScheduleModule.forRoot(),
        TransactionModule,
        AuthModule,
        DailyTodoModule,
        CategoryModule,
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

    // 테스트 카테고리 직접 생성
    const categoryModel = moduleFixture.get<Model<CategoryDocument>>(
      getModelToken(CategoryEntity.name),
    );
    categoryId = new Types.ObjectId();
    await categoryModel.create({
      _id: categoryId,
      title: "업무",
      owner: userId,
      dailyTodos: [],
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

  let dailyTodoId: string;

  it("POST /daily-todos — 데일리 투두 생성", async () => {
    const res = await authed(
      request(app.getHttpServer()).post(`/${API}`).send({
        title: "코드 리뷰",
        date: "2026-03-14",
        category: categoryId.toHexString(),
      }),
    ).expect(201);

    expect(res.body.success).toBe(true);
  });

  it("GET /daily-todos — 목록 조회 (1건)", async () => {
    const res = await authed(
      request(app.getHttpServer()).get(`/${API}`).query({ date: "2026-03-14" }),
    ).expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].title).toBe("코드 리뷰");
    expect(res.body.items[0].progress).toBe("PROGRESS");
    expect(res.body.items[0].cycle).toBe("EVERYDAY");
    expect(res.body.items[0].owner.id).toBe(userId.toHexString());
    expect(res.body.items[0].category.id).toBe(categoryId.toHexString());
    expect(res.body.items[0].reaction).toBeNull();
    dailyTodoId = res.body.items[0].id;
  });

  it("GET /daily-todos/:id — 단건 조회", async () => {
    const res = await authed(
      request(app.getHttpServer()).get(`/${API}/${dailyTodoId}`),
    ).expect(200);

    expect(res.body.items.title).toBe("코드 리뷰");
    expect(res.body.items.id).toBe(dailyTodoId);
  });

  it("GET /daily-todos/by-date/:date — 날짜별 조회", async () => {
    const res = await authed(
      request(app.getHttpServer()).get(`/${API}/by-date/2026-03-14`),
    ).expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].title).toBe("코드 리뷰");
  });

  it("PATCH /daily-todos/:id — 제목 수정", async () => {
    await authed(
      request(app.getHttpServer())
        .patch(`/${API}/${dailyTodoId}`)
        .send({ title: "PR 리뷰" }),
    ).expect(200);

    const res = await authed(
      request(app.getHttpServer()).get(`/${API}/${dailyTodoId}`),
    ).expect(200);

    expect(res.body.items.title).toBe("PR 리뷰");
  });

  it("PATCH /daily-todos/:id/complete-status — 완료 상태 변경", async () => {
    await authed(
      request(app.getHttpServer())
        .patch(`/${API}/${dailyTodoId}/complete-status`)
        .send({ status: "COMPLETED" }),
    ).expect(200);

    const res = await authed(
      request(app.getHttpServer()).get(`/${API}/${dailyTodoId}`),
    ).expect(200);

    expect(res.body.items.progress).toBe("COMPLETED");
  });

  it("PATCH /daily-todos/:id/cycle-status — 반복 주기 변경", async () => {
    await authed(
      request(app.getHttpServer())
        .patch(`/${API}/${dailyTodoId}/cycle-status`)
        .send({ cycle: "EVERY_WEEKDAY" }),
    ).expect(200);

    const res = await authed(
      request(app.getHttpServer()).get(`/${API}/${dailyTodoId}`),
    ).expect(200);

    expect(res.body.items.cycle).toBe("EVERY_WEEKDAY");
  });

  it("PATCH /daily-todos/:id/reaction — 리액션 변경", async () => {
    await authed(
      request(app.getHttpServer())
        .patch(`/${API}/${dailyTodoId}/reaction`)
        .send({
          reaction: "thumbs_up",
          reactionUserId: userId.toHexString(),
        }),
    ).expect(200);

    const res = await authed(
      request(app.getHttpServer()).get(`/${API}/${dailyTodoId}`),
    ).expect(200);

    expect(res.body.items.reaction).not.toBeNull();
    expect(res.body.items.reaction.value).toBe("thumbs_up");
    expect(res.body.items.reaction.reactionUserId).toBe(userId.toHexString());
  });

  it("DELETE /daily-todos/:id — 삭제 후 목록 비어있음", async () => {
    await authed(
      request(app.getHttpServer()).delete(`/${API}/${dailyTodoId}`),
    ).expect(200);

    const res = await authed(
      request(app.getHttpServer()).get(`/${API}`).query({ date: "2026-03-14" }),
    ).expect(200);

    expect(res.body.items).toHaveLength(0);
  });

  it("POST /daily-todos — 빈 제목 시 400", async () => {
    await authed(
      request(app.getHttpServer()).post(`/${API}`).send({
        title: "",
        date: "2026-03-14",
        category: categoryId.toHexString(),
      }),
    ).expect(400);
  });

  it("POST /daily-todos — 잘못된 날짜 형식 시 400", async () => {
    await authed(
      request(app.getHttpServer()).post(`/${API}`).send({
        title: "테스트",
        date: "2026/03/14",
        category: categoryId.toHexString(),
      }),
    ).expect(400);
  });

  it("PATCH /daily-todos/:id/complete-status — 유효하지 않은 상태 시 400", async () => {
    // 먼저 하나 생성
    await authed(
      request(app.getHttpServer()).post(`/${API}`).send({
        title: "검증용",
        date: "2026-03-14",
        category: categoryId.toHexString(),
      }),
    ).expect(201);

    const listRes = await authed(
      request(app.getHttpServer()).get(`/${API}`).query({ date: "2026-03-14" }),
    ).expect(200);

    const id = listRes.body.items[0].id;

    await authed(
      request(app.getHttpServer())
        .patch(`/${API}/${id}/complete-status`)
        .send({ status: "INVALID_STATUS" }),
    ).expect(400);
  });

  it("인증 없이 요청 시 401", async () => {
    await request(app.getHttpServer())
      .get(`/${API}`)
      .query({ date: "2026-03-14" })
      .expect(401);
  });
});
