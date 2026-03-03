import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BoardEntity } from "./domain/model/board.entity";
import { BoardSchema } from "./domain/model/board.schema";
import { DIToken } from "../../shared/di/token.di";
import { BoardRepositoryImpl } from "./infra/repositories/board.repository.impl";
import { BoardPersistenceAdapter } from "./adapters/out/board-persistence.adapter";
import { BoardQueryAdapter } from "./adapters/out/board-query.adapter";
import { BoardController } from "./adapters/in/board.controller";
import { CreateBoardService } from "./application/use-cases/create-board.service";
import { GetBoardService } from "./application/use-cases/get-board.service";
import { GetBoardsByProjectService } from "./application/use-cases/get-boards-by-project.service";
import { UpdateBoardService } from "./application/use-cases/update-board.service";
import { DeleteBoardService } from "./application/use-cases/delete-board.service";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BoardEntity.name, schema: BoardSchema },
    ]),
    UserModule,
  ],
  controllers: [BoardController],
  providers: [
    {
      provide: DIToken.BoardModule.BoardRepository,
      useClass: BoardRepositoryImpl,
    },
    {
      provide: DIToken.BoardModule.BoardPersistencePort,
      useClass: BoardPersistenceAdapter,
    },
    {
      provide: DIToken.BoardModule.BoardQueryPort,
      useClass: BoardQueryAdapter,
    },
    {
      provide: DIToken.BoardModule.CreateBoardUseCase,
      useClass: CreateBoardService,
    },
    {
      provide: DIToken.BoardModule.GetBoardUseCase,
      useClass: GetBoardService,
    },
    {
      provide: DIToken.BoardModule.GetBoardsByProjectUseCase,
      useClass: GetBoardsByProjectService,
    },
    {
      provide: DIToken.BoardModule.UpdateBoardUseCase,
      useClass: UpdateBoardService,
    },
    {
      provide: DIToken.BoardModule.DeleteBoardUseCase,
      useClass: DeleteBoardService,
    },
  ],
  exports: [
    DIToken.BoardModule.BoardRepository,
    DIToken.BoardModule.BoardPersistencePort,
    DIToken.BoardModule.BoardQueryPort,
    DIToken.BoardModule.CreateBoardUseCase,
    DIToken.BoardModule.GetBoardUseCase,
    DIToken.BoardModule.GetBoardsByProjectUseCase,
    DIToken.BoardModule.UpdateBoardUseCase,
    DIToken.BoardModule.DeleteBoardUseCase,
  ],
})
export class BoardModule {}
