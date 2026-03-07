import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserRepository } from "../../domain/model/user.repository";
import { UserDocument } from "../../domain/model/user.schema";
import {
  UserCreateEntitySchema,
  UserEntity,
} from "../../domain/model/user.entity";
import { UserId } from "../../domain/model/user-id.vo";
import { UserNickname } from "../../domain/model/user-nickname.vo";
import { ApprovalStatus } from "../../domain/enums/approval-status.enum";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  public async save(user: UserCreateEntitySchema): Promise<void> {
    await this.userModel.create({
      username: user.getUsername,
      nickname: user.getNickname,
      email: user.getEmail,
      password: user.getPassword,
      friends: [],
      approvalStatus: ApprovalStatus.PENDING,
      isAdmin: false,
    });
  }

  public async findById(id: UserId): Promise<UserDocument> {
    const foundUser = await this.userModel.findById(id.raw).exec();
    if (foundUser == null) {
      throw new NotFoundException(
        `해당 유저를 찾을 수 없어요. ${id.raw.toHexString()}`,
      );
    }

    return foundUser;
  }

  public async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  public async findByNickname(nickname: UserNickname): Promise<UserDocument> {
    const foundUser = await this.userModel
      .findOne({
        nickname: nickname.raw,
      })
      .exec();
    if (foundUser == null) {
      throw new NotFoundException(
        `해당 유저를 찾을 수 없어요. ${nickname.raw}`,
      );
    }

    return foundUser;
  }

  public async findPendingUsers(): Promise<UserDocument[]> {
    return this.userModel
      .find({ approvalStatus: ApprovalStatus.PENDING })
      .exec();
  }

  public async updateApprovalStatus(
    id: UserId,
    status: ApprovalStatus,
  ): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: id.raw },
      { $set: { approvalStatus: status } },
    );

    if (result.modifiedCount === 0) {
      throw new InternalServerErrorException("승인 상태 변경에 실패했어요.");
    }
  }

  public async addFriend(ownerId: UserId, id: UserId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.userModel.findOneAndUpdate(
      { _id: ownerId.raw },
      { $push: { friends: id.raw } },
      { session },
    );
  }
}
