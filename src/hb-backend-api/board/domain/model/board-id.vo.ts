import { Types } from "mongoose";

export class BoardId {
  constructor(private readonly value: Types.ObjectId) {
    Object.freeze(this);
  }

  public static fromString(id: string): BoardId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`올바르지 않은 Board ID 형식이에요. ${id}`);
    }
    return new BoardId(new Types.ObjectId(id));
  }

  public equals(other: BoardId): boolean {
    return this.value.equals(other.value);
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
