import { Types } from "mongoose";

export class FutureMessageId {
  constructor(private readonly value: Types.ObjectId) {
    Object.freeze(this);
  }

  public static fromString(id: string): FutureMessageId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`올바르지 않은 Future Message Id 형식이에요. ${id}`);
    }

    return new FutureMessageId(new Types.ObjectId(id));
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
