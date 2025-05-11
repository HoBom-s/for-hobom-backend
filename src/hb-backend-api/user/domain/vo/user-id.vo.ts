import { Types } from "mongoose";

export class UserId {
  constructor(private readonly value: Types.ObjectId) {}

  public static fromString(id: string): UserId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`올바르지 않은 User ID 형식이에요. ${id}`);
    }

    return new UserId(new Types.ObjectId(id));
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
