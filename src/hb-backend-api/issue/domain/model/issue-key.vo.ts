export class IssueKey {
  private static readonly PATTERN = /^[A-Z]{2,5}-\d+$/;

  constructor(private readonly value: string) {
    if (!IssueKey.PATTERN.test(value)) {
      throw new Error(
        `이슈 키 형식이 올바르지 않아요. (예: HB-142) 입력값: ${value}`,
      );
    }
    Object.freeze(this);
  }

  public static of(projectKey: string, issueNumber: number): IssueKey {
    return new IssueKey(`${projectKey}-${issueNumber}`);
  }

  public static fromString(key: string): IssueKey {
    return new IssueKey(key);
  }

  public equals(other: IssueKey): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public get raw(): string {
    return this.value;
  }
}
