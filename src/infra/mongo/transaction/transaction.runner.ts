import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { MongoSessionContext } from "./transaction.context";

@Injectable()
export class TransactionRunner {
  constructor(@InjectConnection() private readonly conn: Connection) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const session = await this.conn.startSession();
    try {
      return await session.withTransaction(() =>
        MongoSessionContext.runWithSession(session, fn),
      );
    } finally {
      await session.endSession();
    }
  }
}
