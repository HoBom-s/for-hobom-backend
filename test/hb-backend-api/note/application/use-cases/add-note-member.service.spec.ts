import { Test } from "@nestjs/testing";
import { Types } from "mongoose";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { AddNoteMemberService } from "src/hb-backend-api/note/application/use-cases/add-note-member.service";
import { NotePersistencePort } from "src/hb-backend-api/note/domain/ports/out/note-persistence.port";
import { NoteQueryPort } from "src/hb-backend-api/note/domain/ports/out/note-query.port";
import { DIToken } from "src/shared/di/token.di";
import { TransactionRunner } from "src/infra/mongo/transaction/transaction.runner";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { NoteId } from "src/hb-backend-api/note/domain/model/note-id.vo";
import { NoteEntitySchema } from "src/hb-backend-api/note/domain/model/note.entity";
import { NoteType } from "src/hb-backend-api/note/domain/enums/note-type.enum";
import { NoteStatus } from "src/hb-backend-api/note/domain/enums/note-status.enum";
import { NoteColor } from "src/hb-backend-api/note/domain/model/note-color.vo";

const makeOwner = () => new UserId(new Types.ObjectId());
const makeNoteId = () => new NoteId(new Types.ObjectId());

const makeNoteEntity = (
  overrides: Partial<{
    id: NoteId;
    owner: UserId;
    members: UserId[];
  }> = {},
): NoteEntitySchema =>
  NoteEntitySchema.of(
    overrides.id ?? makeNoteId(),
    overrides.owner ?? makeOwner(),
    overrides.members ?? [],
    "테스트 노트",
    "내용입니다",
    NoteType.TEXT,
    [],
    NoteColor.fromString("#FFCCAA"),
    false,
    NoteStatus.ACTIVE,
    null,
    [],
    null,
    0,
  );

const mockPersistencePort = (): jest.Mocked<NotePersistencePort> => ({
  save: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  togglePin: jest.fn(),
  updateOrder: jest.fn(),
  deleteOne: jest.fn(),
  deleteTrashedBefore: jest.fn(),
  emptyTrash: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
});

const mockQueryPort = (): jest.Mocked<NoteQueryPort> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findMinOrder: jest.fn(),
});

const mockTransactionRunner = () => ({
  run: jest.fn((cb: () => Promise<void>) => cb()),
});

describe("AddNoteMemberService", () => {
  let service: AddNoteMemberService;
  let persistencePort: jest.Mocked<NotePersistencePort>;
  let queryPort: jest.Mocked<NoteQueryPort>;

  beforeEach(async () => {
    persistencePort = mockPersistencePort();
    queryPort = mockQueryPort();
    const module = await Test.createTestingModule({
      providers: [
        AddNoteMemberService,
        {
          provide: DIToken.NoteModule.NotePersistencePort,
          useValue: persistencePort,
        },
        { provide: DIToken.NoteModule.NoteQueryPort, useValue: queryPort },
        { provide: TransactionRunner, useValue: mockTransactionRunner() },
      ],
    }).compile();
    service = module.get(AddNoteMemberService);
  });

  it("should add member when caller is owner and member is new", async () => {
    const owner = makeOwner();
    const noteId = makeNoteId();
    const memberUserId = makeOwner();
    queryPort.findById.mockResolvedValue(makeNoteEntity({ id: noteId, owner }));

    await service.invoke(noteId, owner, memberUserId);

    expect(queryPort.findById).toHaveBeenCalledWith(noteId, owner);
    expect(persistencePort.addMember).toHaveBeenCalledWith(
      noteId,
      memberUserId,
    );
  });

  it("should throw ForbiddenException when caller is not the owner", async () => {
    const owner = makeOwner();
    const caller = makeOwner(); // different user
    const noteId = makeNoteId();
    queryPort.findById.mockResolvedValue(makeNoteEntity({ id: noteId, owner }));

    await expect(service.invoke(noteId, caller, makeOwner())).rejects.toThrow(
      ForbiddenException,
    );
    expect(persistencePort.addMember).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException when adding owner as member", async () => {
    const owner = makeOwner();
    const noteId = makeNoteId();
    queryPort.findById.mockResolvedValue(makeNoteEntity({ id: noteId, owner }));

    await expect(service.invoke(noteId, owner, owner)).rejects.toThrow(
      BadRequestException,
    );
    expect(persistencePort.addMember).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException when user is already a member", async () => {
    const owner = makeOwner();
    const existingMember = makeOwner();
    const noteId = makeNoteId();
    queryPort.findById.mockResolvedValue(
      makeNoteEntity({ id: noteId, owner, members: [existingMember] }),
    );

    await expect(service.invoke(noteId, owner, existingMember)).rejects.toThrow(
      BadRequestException,
    );
    expect(persistencePort.addMember).not.toHaveBeenCalled();
  });
});
