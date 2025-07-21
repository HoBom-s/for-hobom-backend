import { Types } from "mongoose";

export class MenuRecommendationId {
  constructor(private readonly value: Types.ObjectId) {
    this.value = value;
  }

  public static fromString(id: string): MenuRecommendationId {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`올바르지 않은 Menu Recommendation Id 형식이에요. ${id}`);
    }

    return new MenuRecommendationId(new Types.ObjectId(id));
  }

  public toString(): string {
    return this.value.toHexString();
  }

  public get raw(): Types.ObjectId {
    return this.value;
  }
}
