import { Types } from "mongoose";

export class ProjectId {
  constructor(private readonly value: Types.ObjectId) {
    Object.freeze(this);
  }

  public static fromString(id: string): ProjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`올바르지 않은 Project ID 형식이에요. ${id}`);
    }
    return new ProjectId(new Types.ObjectId(id));
  }

  public equals(other: ProjectId): boolean {
    return this.value.equals(other.value);
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
