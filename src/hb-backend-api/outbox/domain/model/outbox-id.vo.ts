import { Types } from "mongoose";

export class OutboxId {
  constructor(private readonly value: Types.ObjectId) {
    Object.freeze(this);
  }

  public static fromString(id: string): OutboxId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`올바르지 않은 Outbox Id 형식이에요. ${id}`);
    }

    return new OutboxId(new Types.ObjectId(id));
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
