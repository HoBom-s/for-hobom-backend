import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BoardRepository } from "../../domain/repositories/board.repository";
import { BoardDocument } from "../../domain/model/board.schema";
import {
  CreateBoardEntity,
  BoardEntity,
} from "../../domain/model/board.entity";
import { BoardId } from "../../domain/model/board-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class BoardRepositoryImpl implements BoardRepository {
  constructor(
    @InjectModel(BoardEntity.name)
    private readonly boardModel: Model<BoardDocument>,
  ) {}

  public async save(entity: CreateBoardEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.boardModel.create(
      [
        {
          project: entity.getProject.raw,
          name: entity.getName,
          type: entity.getType,
          createdBy: entity.getCreatedBy.raw,
        },
      ],
      { session },
    );
  }

  public async findById(id: BoardId): Promise<BoardDocument> {
    const found = await this.boardModel.findOne({ _id: id.raw }).exec();
    if (found == null) {
      throw new NotFoundException(
        `해당 보드를 찾을 수 없어요. ID: ${id.toString()}`,
      );
    }
    return found;
  }

  public async findByProject(projectId: ProjectId): Promise<BoardDocument[]> {
    return this.boardModel.find({ project: projectId.raw }).exec();
  }

  public async update(
    id: BoardId,
    data: Record<string, unknown>,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.boardModel.findOneAndUpdate(
      { _id: id.raw },
      { $set: data },
      { session },
    );
  }

  public async deleteOne(id: BoardId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.boardModel.deleteOne({ _id: id.raw }, { session });
  }
}
