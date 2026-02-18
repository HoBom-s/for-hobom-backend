import { Types } from "mongoose";

export class TodayMenuId {
  constructor(private readonly value: Types.ObjectId) {
    this.value = value;
    Object.freeze(this);
  }

  public static fromSting(id: string): TodayMenuId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Today Menu Id가 유효하지 않아요. ${id}`);
    }

    return new TodayMenuId(new Types.ObjectId(id));
  }

  public equals(other: TodayMenuId): boolean {
    return this.value.equals(other.value);
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
