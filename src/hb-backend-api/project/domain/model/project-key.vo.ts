export class ProjectKey {
  private static readonly PATTERN = /^[A-Z]{2,5}$/;

  constructor(private readonly value: string) {
    if (!ProjectKey.PATTERN.test(value)) {
      throw new Error(
        `프로젝트 키는 대문자 영어 2~5자여야 해요. 입력값: ${value}`,
      );
    }
    Object.freeze(this);
  }

  public static fromString(key: string): ProjectKey {
    return new ProjectKey(key.toUpperCase());
  }

  public equals(other: ProjectKey): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public get raw(): string {
    return this.value;
  }
}
