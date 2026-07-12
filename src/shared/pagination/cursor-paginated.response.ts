import { ApiProperty } from "@nestjs/swagger";

export class CursorPaginatedResponse<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;

  @ApiProperty({ type: Boolean })
  hasNext: boolean;

  constructor(data: T[], nextCursor: string | null, hasNext: boolean) {
    this.data = data;
    this.nextCursor = nextCursor;
    this.hasNext = hasNext;
  }

  public static of<T>(
    items: T[],
    size: number,
    getId: (item: T) => string,
  ): CursorPaginatedResponse<T> {
    const hasNext = items.length > size;
    const data = hasNext ? items.slice(0, size) : items;
    const nextCursor = hasNext ? getId(data[data.length - 1]) : null;
    return new CursorPaginatedResponse(data, nextCursor, hasNext);
  }
}
