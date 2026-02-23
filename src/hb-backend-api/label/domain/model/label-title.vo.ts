export class LabelTitle {
  constructor(private readonly value: string) {
    Object.freeze(this);
  }

  public static fromString(title: string): LabelTitle {
    if (title == null) {
      throw new Error("라벨 제목이 정의되지 않았어요.");
    }

    const trimmed = title.trim();
    if (trimmed.length === 0 || trimmed.length < 1) {
      throw new Error("라벨 제목은 1자 이상이어야 해요.");
    }

    return new LabelTitle(trimmed);
  }

  public equals(other: LabelTitle): boolean {
    return this.value === other.value;
  }

  get raw(): string {
    return this.value;
  }
}
