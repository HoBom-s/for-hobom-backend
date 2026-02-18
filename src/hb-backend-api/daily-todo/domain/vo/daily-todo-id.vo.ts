import { Types } from "mongoose";

export class DailyTodoId {
  constructor(private readonly value: Types.ObjectId) {
    this.value = value;
    Object.freeze(this);
  }

  public static fromString(id: string): DailyTodoId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`올바르지 않은 DailyTodo ID 형식이에요. ${id}`);
    }

    return new DailyTodoId(new Types.ObjectId(id));
  }

  public equals(other: DailyTodoId): boolean {
    return this.value.equals(other.value);
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
