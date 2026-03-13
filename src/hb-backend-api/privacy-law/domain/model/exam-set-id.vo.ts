import { Types } from "mongoose";

export class ExamSetId {
  constructor(private readonly value: Types.ObjectId) {
    Object.freeze(this);
  }

  public static fromString(id: string): ExamSetId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`올바르지 않은 ExamSet ID 형식이에요. ${id}`);
    }
    return new ExamSetId(new Types.ObjectId(id));
  }

  public equals(other: ExamSetId): boolean {
    return this.value.equals(other.value);
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
