import { Types } from "mongoose";

export class LawDiffId {
  constructor(private readonly value: Types.ObjectId) {
    Object.freeze(this);
  }

  public static fromString(id: string): LawDiffId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`올바르지 않은 LawDiff ID 형식이에요. ${id}`);
    }
    return new LawDiffId(new Types.ObjectId(id));
  }

  public equals(other: LawDiffId): boolean {
    return this.value.equals(other.value);
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
