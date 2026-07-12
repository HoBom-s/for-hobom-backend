import { Types } from "mongoose";

export class ProjectLabelId {
  constructor(private readonly value: Types.ObjectId) {
    Object.freeze(this);
  }

  public static fromString(id: string): ProjectLabelId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`올바르지 않은 ProjectLabel ID 형식이에요. ${id}`);
    }
    return new ProjectLabelId(new Types.ObjectId(id));
  }

  public equals(other: ProjectLabelId): boolean {
    return this.value.equals(other.value);
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
