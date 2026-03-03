/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { CreateProjectService } from "src/hb-backend-api/project/application/use-cases/create-project.service";
import { GetProjectService } from "src/hb-backend-api/project/application/use-cases/get-project.service";
import { GetMyProjectsService } from "src/hb-backend-api/project/application/use-cases/get-my-projects.service";
import { UpdateProjectService } from "src/hb-backend-api/project/application/use-cases/update-project.service";
import { DeleteProjectService } from "src/hb-backend-api/project/application/use-cases/delete-project.service";
import { AddProjectMemberService } from "src/hb-backend-api/project/application/use-cases/add-project-member.service";
import { RemoveProjectMemberService } from "src/hb-backend-api/project/application/use-cases/remove-project-member.service";
import { UpdateProjectMemberRoleService } from "src/hb-backend-api/project/application/use-cases/update-project-member-role.service";
import { UpdateProjectWorkflowService } from "src/hb-backend-api/project/application/use-cases/update-project-workflow.service";
import { UpdateProjectIssueTypesService } from "src/hb-backend-api/project/application/use-cases/update-project-issue-types.service";
import { UpdateProjectPrioritiesService } from "src/hb-backend-api/project/application/use-cases/update-project-priorities.service";
import { ProjectPersistencePort } from "src/hb-backend-api/project/ports/out/project-persistence.port";
import { ProjectQueryPort } from "src/hb-backend-api/project/ports/out/project-query.port";
import { IssuePersistencePort } from "src/hb-backend-api/issue/ports/out/issue-persistence.port";
import { IssueCommentPersistencePort } from "src/hb-backend-api/issue/ports/out/issue-comment-persistence.port";
import { IssueHistoryPersistencePort } from "src/hb-backend-api/issue/ports/out/issue-history-persistence.port";
import { IssueQueryPort } from "src/hb-backend-api/issue/ports/out/issue-query.port";
import { SprintPersistencePort } from "src/hb-backend-api/sprint/ports/out/sprint-persistence.port";
import { BoardPersistencePort } from "src/hb-backend-api/board/ports/out/board-persistence.port";
import { ProjectLabelPersistencePort } from "src/hb-backend-api/project-label/ports/out/project-label-persistence.port";
import { ProjectId } from "src/hb-backend-api/project/domain/model/project-id.vo";
import { ProjectKey } from "src/hb-backend-api/project/domain/model/project-key.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { MemberRole } from "src/hb-backend-api/project/domain/enums/member-role.enum";
import { StatusCategory } from "src/hb-backend-api/project/domain/enums/status-category.enum";

// ── helpers ──────────────────────────────────────
const makeProjectId = () =>
  ProjectId.fromString(new Types.ObjectId().toHexString());
const makeUserId = () => new UserId(new Types.ObjectId());
const makeProjectKey = (key = "HB") => ProjectKey.fromString(key);

const makeProjectDoc = (overrides: Record<string, unknown> = {}) => {
  const ownerId = new Types.ObjectId();
  return {
    _id: new Types.ObjectId(),
    key: "HB",
    name: "test",
    description: null,
    owner: ownerId,
    members: [
      { userId: ownerId, role: MemberRole.ADMIN, joinedAt: new Date() },
    ],
    issueSequence: 0,
    workflow: null,
    issueTypes: [],
    priorities: [],
    ...overrides,
  } as any;
};

const mockProjectQueryPort = (): Record<keyof ProjectQueryPort, jest.Mock> => ({
  findById: jest.fn(),
  findByKey: jest.fn(),
  findByOwner: jest.fn(),
  findByMember: jest.fn(),
});

const mockProjectPersistencePort = (): Record<
  keyof ProjectPersistencePort,
  jest.Mock
> => ({
  save: jest.fn(),
  update: jest.fn(),
  incrementIssueSequence: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
  deleteOne: jest.fn(),
});

// ──────────────────────────────────────────────
// 1. CreateProjectService
// ──────────────────────────────────────────────
describe("CreateProjectService", () => {
  let service: CreateProjectService;
  let queryPort: jest.Mocked<ProjectQueryPort>;
  let persistencePort: jest.Mocked<ProjectPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProjectService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useFactory: mockProjectPersistencePort,
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(CreateProjectService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
    persistencePort = module.get(DIToken.ProjectModule.ProjectPersistencePort);
  });

  it("프로젝트를 정상 생성하고 기본값을 설정해야 한다", async () => {
    const key = makeProjectKey();
    const owner = makeUserId();
    const savedDoc = makeProjectDoc();

    // verifyDuplicateProjectKey: 중복 없음
    queryPort.findByKey.mockResolvedValueOnce(null);
    // saveProject
    persistencePort.save.mockResolvedValue(undefined);
    // setupDefaults: findByKey returns saved doc
    queryPort.findByKey.mockResolvedValueOnce(savedDoc);
    // update with defaults
    persistencePort.update.mockResolvedValue(undefined);

    await service.invoke(key, "test", null, owner);

    expect(persistencePort.save).toHaveBeenCalledTimes(1);
    expect(queryPort.findByKey).toHaveBeenCalledTimes(2);
    expect(persistencePort.update).toHaveBeenCalledTimes(1);
    expect(persistencePort.update).toHaveBeenCalledWith(
      expect.any(ProjectId),
      expect.objectContaining({
        workflow: expect.any(Object),
        issueTypes: expect.any(Array),
        priorities: expect.any(Array),
      }),
    );
  });

  it("이미 존재하는 프로젝트 키이면 BadRequestException을 던져야 한다", async () => {
    const key = makeProjectKey();
    const owner = makeUserId();
    queryPort.findByKey.mockResolvedValueOnce(makeProjectDoc());

    await expect(service.invoke(key, "test", null, owner)).rejects.toThrow(
      BadRequestException,
    );
    expect(persistencePort.save).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// 2. GetProjectService
// ──────────────────────────────────────────────
describe("GetProjectService", () => {
  let service: GetProjectService;
  let queryPort: jest.Mocked<ProjectQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProjectService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
      ],
    }).compile();

    service = module.get(GetProjectService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
  });

  it("ID로 프로젝트를 정상 조회해야 한다", async () => {
    const id = makeProjectId();
    const doc = makeProjectDoc();
    queryPort.findById.mockResolvedValue(doc);

    const result = await service.invoke(id);

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(result).toBe(doc);
  });
});

// ──────────────────────────────────────────────
// 3. GetMyProjectsService
// ──────────────────────────────────────────────
describe("GetMyProjectsService", () => {
  let service: GetMyProjectsService;
  let queryPort: jest.Mocked<ProjectQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyProjectsService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
      ],
    }).compile();

    service = module.get(GetMyProjectsService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
  });

  it("소유 프로젝트와 멤버 프로젝트를 합치고 중복을 제거해야 한다", async () => {
    const userId = makeUserId();
    const sharedId = new Types.ObjectId();
    const docA = makeProjectDoc({ _id: sharedId });
    const docB = makeProjectDoc(); // 다른 _id
    // owned: docA, docB / membered: docA (중복)
    queryPort.findByOwner.mockResolvedValue([docA, docB]);
    queryPort.findByMember.mockResolvedValue([docA]);

    const result = await service.invoke(userId);

    expect(result).toHaveLength(2);
  });

  it("프로젝트가 없으면 빈 배열을 반환해야 한다", async () => {
    queryPort.findByOwner.mockResolvedValue([]);
    queryPort.findByMember.mockResolvedValue([]);

    const result = await service.invoke(makeUserId());

    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// 4. UpdateProjectService
// ──────────────────────────────────────────────
describe("UpdateProjectService", () => {
  let service: UpdateProjectService;
  let queryPort: jest.Mocked<ProjectQueryPort>;
  let persistencePort: jest.Mocked<ProjectPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProjectService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useFactory: mockProjectPersistencePort,
        },
      ],
    }).compile();

    service = module.get(UpdateProjectService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
    persistencePort = module.get(DIToken.ProjectModule.ProjectPersistencePort);
  });

  it("프로젝트를 정상적으로 수정해야 한다", async () => {
    const id = makeProjectId();
    queryPort.findById.mockResolvedValue(makeProjectDoc());
    persistencePort.update.mockResolvedValue(undefined);

    await service.invoke(id, "새이름", "새설명");

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(persistencePort.update).toHaveBeenCalledWith(id, {
      name: "새이름",
      description: "새설명",
    });
  });
});

// ──────────────────────────────────────────────
// 5. DeleteProjectService
// ──────────────────────────────────────────────
describe("DeleteProjectService", () => {
  let service: DeleteProjectService;
  let queryPort: jest.Mocked<ProjectQueryPort>;
  let projectPersistence: jest.Mocked<ProjectPersistencePort>;
  let issuePersistence: jest.Mocked<IssuePersistencePort>;
  let issueCommentPersistence: jest.Mocked<IssueCommentPersistencePort>;
  let issueHistoryPersistence: jest.Mocked<IssueHistoryPersistencePort>;
  let sprintPersistence: jest.Mocked<SprintPersistencePort>;
  let boardPersistence: jest.Mocked<BoardPersistencePort>;
  let projectLabelPersistence: jest.Mocked<ProjectLabelPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProjectService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useFactory: mockProjectPersistencePort,
        },
        {
          provide: DIToken.IssueModule.IssuePersistencePort,
          useValue: { deleteByProject: jest.fn() },
        },
        {
          provide: DIToken.IssueModule.IssueCommentPersistencePort,
          useValue: { deleteByProject: jest.fn() },
        },
        {
          provide: DIToken.IssueModule.IssueHistoryPersistencePort,
          useValue: { deleteByProject: jest.fn() },
        },
        {
          provide: DIToken.SprintModule.SprintPersistencePort,
          useValue: { deleteByProject: jest.fn() },
        },
        {
          provide: DIToken.BoardModule.BoardPersistencePort,
          useValue: { deleteByProject: jest.fn() },
        },
        {
          provide: DIToken.ProjectLabelModule.ProjectLabelPersistencePort,
          useValue: { deleteByProject: jest.fn() },
        },
        {
          provide: TransactionRunner,
          useValue: { run: jest.fn((cb) => cb()) },
        },
      ],
    }).compile();

    service = module.get(DeleteProjectService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
    projectPersistence = module.get(
      DIToken.ProjectModule.ProjectPersistencePort,
    );
    issuePersistence = module.get(DIToken.IssueModule.IssuePersistencePort);
    issueCommentPersistence = module.get(
      DIToken.IssueModule.IssueCommentPersistencePort,
    );
    issueHistoryPersistence = module.get(
      DIToken.IssueModule.IssueHistoryPersistencePort,
    );
    sprintPersistence = module.get(DIToken.SprintModule.SprintPersistencePort);
    boardPersistence = module.get(DIToken.BoardModule.BoardPersistencePort);
    projectLabelPersistence = module.get(
      DIToken.ProjectLabelModule.ProjectLabelPersistencePort,
    );
  });

  it("프로젝트와 관련 데이터를 모두 삭제해야 한다", async () => {
    const id = makeProjectId();
    queryPort.findById.mockResolvedValue(makeProjectDoc());
    issuePersistence.deleteByProject.mockResolvedValue(undefined);
    issueCommentPersistence.deleteByProject.mockResolvedValue(undefined);
    issueHistoryPersistence.deleteByProject.mockResolvedValue(undefined);
    sprintPersistence.deleteByProject.mockResolvedValue(undefined);
    boardPersistence.deleteByProject.mockResolvedValue(undefined);
    projectLabelPersistence.deleteByProject.mockResolvedValue(undefined);
    projectPersistence.deleteOne.mockResolvedValue(undefined);

    await service.invoke(id);

    expect(queryPort.findById).toHaveBeenCalledWith(id);
    expect(issuePersistence.deleteByProject).toHaveBeenCalledWith(id);
    expect(issueCommentPersistence.deleteByProject).toHaveBeenCalledWith(id);
    expect(issueHistoryPersistence.deleteByProject).toHaveBeenCalledWith(id);
    expect(sprintPersistence.deleteByProject).toHaveBeenCalledWith(id);
    expect(boardPersistence.deleteByProject).toHaveBeenCalledWith(id);
    expect(projectLabelPersistence.deleteByProject).toHaveBeenCalledWith(id);
    expect(projectPersistence.deleteOne).toHaveBeenCalledWith(id);
  });
});

// ──────────────────────────────────────────────
// 6. AddProjectMemberService
// ──────────────────────────────────────────────
describe("AddProjectMemberService", () => {
  let service: AddProjectMemberService;
  let queryPort: jest.Mocked<ProjectQueryPort>;
  let persistencePort: jest.Mocked<ProjectPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddProjectMemberService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useFactory: mockProjectPersistencePort,
        },
      ],
    }).compile();

    service = module.get(AddProjectMemberService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
    persistencePort = module.get(DIToken.ProjectModule.ProjectPersistencePort);
  });

  it("새로운 멤버를 정상적으로 추가해야 한다", async () => {
    const projectId = makeProjectId();
    const newUserId = makeUserId();
    const existingMemberId = new Types.ObjectId();
    const doc = makeProjectDoc({
      members: [
        {
          userId: existingMemberId,
          role: MemberRole.ADMIN,
          joinedAt: new Date(),
        },
      ],
    });
    queryPort.findById.mockResolvedValue(doc);
    persistencePort.addMember.mockResolvedValue(undefined);

    await service.invoke(projectId, newUserId, MemberRole.MEMBER);

    expect(persistencePort.addMember).toHaveBeenCalledWith(
      projectId,
      newUserId,
      MemberRole.MEMBER,
    );
  });

  it("이미 멤버로 등록된 사용자이면 BadRequestException을 던져야 한다", async () => {
    const projectId = makeProjectId();
    const existingMemberRaw = new Types.ObjectId();
    const userId = new UserId(existingMemberRaw);
    const doc = makeProjectDoc({
      members: [
        {
          userId: existingMemberRaw,
          role: MemberRole.ADMIN,
          joinedAt: new Date(),
        },
      ],
    });
    queryPort.findById.mockResolvedValue(doc);

    await expect(
      service.invoke(projectId, userId, MemberRole.MEMBER),
    ).rejects.toThrow(BadRequestException);
    expect(persistencePort.addMember).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// 7. RemoveProjectMemberService
// ──────────────────────────────────────────────
describe("RemoveProjectMemberService", () => {
  let service: RemoveProjectMemberService;
  let queryPort: jest.Mocked<ProjectQueryPort>;
  let persistencePort: jest.Mocked<ProjectPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveProjectMemberService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useFactory: mockProjectPersistencePort,
        },
      ],
    }).compile();

    service = module.get(RemoveProjectMemberService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
    persistencePort = module.get(DIToken.ProjectModule.ProjectPersistencePort);
  });

  it("멤버를 정상적으로 제거해야 한다", async () => {
    const projectId = makeProjectId();
    const ownerRaw = new Types.ObjectId();
    const memberRaw = new Types.ObjectId();
    const memberUserId = new UserId(memberRaw);
    const doc = makeProjectDoc({
      owner: ownerRaw,
      members: [
        { userId: ownerRaw, role: MemberRole.ADMIN, joinedAt: new Date() },
        { userId: memberRaw, role: MemberRole.MEMBER, joinedAt: new Date() },
      ],
    });
    queryPort.findById.mockResolvedValue(doc);
    persistencePort.removeMember.mockResolvedValue(undefined);

    await service.invoke(projectId, memberUserId);

    expect(persistencePort.removeMember).toHaveBeenCalledWith(
      projectId,
      memberUserId,
    );
  });

  it("Owner를 제거하려 하면 BadRequestException을 던져야 한다", async () => {
    const projectId = makeProjectId();
    const ownerRaw = new Types.ObjectId();
    const ownerUserId = new UserId(ownerRaw);
    const doc = makeProjectDoc({
      owner: ownerRaw,
      members: [
        { userId: ownerRaw, role: MemberRole.ADMIN, joinedAt: new Date() },
      ],
    });
    queryPort.findById.mockResolvedValue(doc);

    await expect(service.invoke(projectId, ownerUserId)).rejects.toThrow(
      "Owner는 제거할 수 없어요.",
    );
    expect(persistencePort.removeMember).not.toHaveBeenCalled();
  });

  it("멤버가 아닌 사용자를 제거하려 하면 BadRequestException을 던져야 한다", async () => {
    const projectId = makeProjectId();
    const ownerRaw = new Types.ObjectId();
    const nonMemberUserId = makeUserId();
    const doc = makeProjectDoc({
      owner: ownerRaw,
      members: [
        { userId: ownerRaw, role: MemberRole.ADMIN, joinedAt: new Date() },
      ],
    });
    queryPort.findById.mockResolvedValue(doc);

    await expect(service.invoke(projectId, nonMemberUserId)).rejects.toThrow(
      "해당 사용자는 멤버가 아니에요.",
    );
    expect(persistencePort.removeMember).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// 8. UpdateProjectMemberRoleService
// ──────────────────────────────────────────────
describe("UpdateProjectMemberRoleService", () => {
  let service: UpdateProjectMemberRoleService;
  let queryPort: jest.Mocked<ProjectQueryPort>;
  let persistencePort: jest.Mocked<ProjectPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProjectMemberRoleService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useFactory: mockProjectPersistencePort,
        },
      ],
    }).compile();

    service = module.get(UpdateProjectMemberRoleService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
    persistencePort = module.get(DIToken.ProjectModule.ProjectPersistencePort);
  });

  it("멤버 역할을 정상적으로 변경해야 한다", async () => {
    const projectId = makeProjectId();
    const ownerRaw = new Types.ObjectId();
    const memberRaw = new Types.ObjectId();
    const memberUserId = new UserId(memberRaw);
    const doc = makeProjectDoc({
      owner: ownerRaw,
      members: [
        { userId: ownerRaw, role: MemberRole.ADMIN, joinedAt: new Date() },
        { userId: memberRaw, role: MemberRole.MEMBER, joinedAt: new Date() },
      ],
    });
    queryPort.findById.mockResolvedValue(doc);
    persistencePort.update.mockResolvedValue(undefined);

    await service.invoke(projectId, memberUserId, MemberRole.VIEWER);

    expect(persistencePort.update).toHaveBeenCalledTimes(1);
  });

  it("Owner의 역할을 변경하려 하면 BadRequestException을 던져야 한다", async () => {
    const projectId = makeProjectId();
    const ownerRaw = new Types.ObjectId();
    const ownerUserId = new UserId(ownerRaw);
    const doc = makeProjectDoc({
      owner: ownerRaw,
      members: [
        { userId: ownerRaw, role: MemberRole.ADMIN, joinedAt: new Date() },
      ],
    });
    queryPort.findById.mockResolvedValue(doc);

    await expect(
      service.invoke(projectId, ownerUserId, MemberRole.VIEWER),
    ).rejects.toThrow("Owner의 역할은 변경할 수 없어요.");
    expect(persistencePort.update).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// 9. UpdateProjectWorkflowService
// ──────────────────────────────────────────────
describe("UpdateProjectWorkflowService", () => {
  let service: UpdateProjectWorkflowService;
  let queryPort: jest.Mocked<ProjectQueryPort>;
  let persistencePort: jest.Mocked<ProjectPersistencePort>;
  let issueQueryPort: jest.Mocked<IssueQueryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProjectWorkflowService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useFactory: mockProjectPersistencePort,
        },
        {
          provide: DIToken.IssueModule.IssueQueryPort,
          useValue: { findByProject: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(UpdateProjectWorkflowService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
    persistencePort = module.get(DIToken.ProjectModule.ProjectPersistencePort);
    issueQueryPort = module.get(DIToken.IssueModule.IssueQueryPort);
  });

  it("워크플로우를 정상적으로 업데이트해야 한다", async () => {
    const projectId = makeProjectId();
    const workflow = {
      statuses: [
        { id: "todo", name: "할 일", category: StatusCategory.TODO, order: 0 },
        { id: "done", name: "완료", category: StatusCategory.DONE, order: 1 },
      ],
      transitions: [{ from: "todo", to: "done", name: "완료" }],
    };
    queryPort.findById.mockResolvedValue(makeProjectDoc());
    issueQueryPort.findByProject.mockResolvedValue([]);
    persistencePort.update.mockResolvedValue(undefined);

    await service.invoke(projectId, workflow);

    expect(persistencePort.update).toHaveBeenCalledWith(projectId, {
      workflow,
    });
  });

  it("이슈에서 사용 중인 상태를 삭제하려 하면 BadRequestException을 던져야 한다", async () => {
    const projectId = makeProjectId();
    const workflow = {
      statuses: [
        { id: "todo", name: "할 일", category: StatusCategory.TODO, order: 0 },
      ],
      transitions: [],
    };
    queryPort.findById.mockResolvedValue(makeProjectDoc());
    // 이슈가 "in-progress" 상태를 사용 중인데, 새 워크플로우에 "in-progress"가 없음
    issueQueryPort.findByProject.mockResolvedValue([
      { status: "in-progress" } as any,
    ]);

    await expect(service.invoke(projectId, workflow)).rejects.toThrow(
      BadRequestException,
    );
    expect(persistencePort.update).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// 10. UpdateProjectIssueTypesService
// ──────────────────────────────────────────────
describe("UpdateProjectIssueTypesService", () => {
  let service: UpdateProjectIssueTypesService;
  let queryPort: jest.Mocked<ProjectQueryPort>;
  let persistencePort: jest.Mocked<ProjectPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProjectIssueTypesService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useFactory: mockProjectPersistencePort,
        },
      ],
    }).compile();

    service = module.get(UpdateProjectIssueTypesService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
    persistencePort = module.get(DIToken.ProjectModule.ProjectPersistencePort);
  });

  it("이슈 타입을 정상적으로 업데이트해야 한다", async () => {
    const projectId = makeProjectId();
    const issueTypes = [
      { id: "task", name: "태스크", icon: "task", isSubtask: false },
    ];
    queryPort.findById.mockResolvedValue(makeProjectDoc());
    persistencePort.update.mockResolvedValue(undefined);

    await service.invoke(projectId, issueTypes);

    expect(persistencePort.update).toHaveBeenCalledWith(projectId, {
      issueTypes,
    });
  });
});

// ──────────────────────────────────────────────
// 11. UpdateProjectPrioritiesService
// ──────────────────────────────────────────────
describe("UpdateProjectPrioritiesService", () => {
  let service: UpdateProjectPrioritiesService;
  let queryPort: jest.Mocked<ProjectQueryPort>;
  let persistencePort: jest.Mocked<ProjectPersistencePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProjectPrioritiesService,
        {
          provide: DIToken.ProjectModule.ProjectQueryPort,
          useFactory: mockProjectQueryPort,
        },
        {
          provide: DIToken.ProjectModule.ProjectPersistencePort,
          useFactory: mockProjectPersistencePort,
        },
      ],
    }).compile();

    service = module.get(UpdateProjectPrioritiesService);
    queryPort = module.get(DIToken.ProjectModule.ProjectQueryPort);
    persistencePort = module.get(DIToken.ProjectModule.ProjectPersistencePort);
  });

  it("우선순위를 정상적으로 업데이트해야 한다", async () => {
    const projectId = makeProjectId();
    const priorities = [{ id: "high", name: "높음", icon: "high", order: 0 }];
    queryPort.findById.mockResolvedValue(makeProjectDoc());
    persistencePort.update.mockResolvedValue(undefined);

    await service.invoke(projectId, priorities);

    expect(persistencePort.update).toHaveBeenCalledWith(projectId, {
      priorities,
    });
  });
});
