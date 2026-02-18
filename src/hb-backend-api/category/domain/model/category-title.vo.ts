export class CategoryTitle {
  constructor(private readonly value: string) {
    this.value = value;
    Object.freeze(this);
  }

  public static fromString(title: string): CategoryTitle {
    if (title == null) {
      throw new Error("카테고리 제목이 정의되지 않았어요.");
    }

    const value = title.trim();
    if (value.length === 0 || value.length < 2) {
      throw new Error("카테고리 제목은 1자 이성이어야 해요.");
    }

    return new CategoryTitle(title);
  }

  public equals(other: CategoryTitle): boolean {
    return this.value === other.value;
  }

  get raw(): string {
    return this.value;
  }
}
