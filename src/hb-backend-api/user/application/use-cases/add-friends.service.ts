import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { AddFriendsUseCase } from "../../domain/ports/in/add-friends.use-case";
import { UserId } from "../../domain/model/user-id.vo";
import { UserPersistencePort } from "../../domain/ports/out/user-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";
import { UserQueryPort } from "../../domain/ports/out/user-query.port";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class AddFriendsService implements AddFriendsUseCase {
  constructor(
    @Inject(DIToken.UserModule.UserPersistencePort)
    private readonly userPersistentPort: UserPersistencePort,
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(ownerId: UserId, id: UserId): Promise<void> {
    const foundUser = await this.userQueryPort.findById(id);
    const friend = foundUser.getFriends.find(
      (item) => item.toString() === id.toString(),
    );
    if (friend) {
      throw new BadRequestException("이미 추가된 친구에요.");
    }
    await this.userPersistentPort.addFriend(ownerId, id);
  }
}
