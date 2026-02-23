export class NoteColor {
  private static readonly DEFAULT = "#FFFFFF";
  private static readonly HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

  constructor(private readonly value: string) {
    Object.freeze(this);
  }

  public static fromString(color: string | null): NoteColor {
    if (color == null || color.trim().length === 0) {
      return new NoteColor(NoteColor.DEFAULT);
    }
    if (!NoteColor.HEX_PATTERN.test(color)) {
      throw new Error(`올바르지 않은 색상 형식이에요. ${color}`);
    }
    return new NoteColor(color);
  }

  public static default(): NoteColor {
    return new NoteColor(NoteColor.DEFAULT);
  }

  public equals(other: NoteColor): boolean {
    return this.value === other.value;
  }

  public get raw(): string {
    return this.value;
  }
}
