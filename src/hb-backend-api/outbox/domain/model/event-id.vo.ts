export class EventId {
  constructor(private readonly value: string) {
    Object.freeze(this);
  }

  public static fromString(id: string): EventId {
    if (id == null || id.length === 0) {
      throw new Error(`올바르지 않은 Event Id 에요. ${id}`);
    }

    return new EventId(id);
  }

  public get raw(): string {
    return this.value;
  }
}
