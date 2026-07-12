import { CursorPaginatedResponse } from "src/shared/pagination/cursor-paginated.response";

describe("CursorPaginatedResponse", () => {
  const getId = (item: { id: string }) => item.id;

  it("should return hasNext=false when items fit within size", () => {
    const items = [{ id: "1" }, { id: "2" }];
    const result = CursorPaginatedResponse.of(items, 5, getId);

    expect(result.data).toHaveLength(2);
    expect(result.hasNext).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it("should return hasNext=true and slice data when items exceed size", () => {
    const items = [{ id: "1" }, { id: "2" }, { id: "3" }];
    const result = CursorPaginatedResponse.of(items, 2, getId);

    expect(result.data).toHaveLength(2);
    expect(result.hasNext).toBe(true);
    expect(result.nextCursor).toBe("2");
  });

  it("should return hasNext=false when items equal size", () => {
    const items = [{ id: "1" }, { id: "2" }];
    const result = CursorPaginatedResponse.of(items, 2, getId);

    expect(result.data).toHaveLength(2);
    expect(result.hasNext).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it("should handle empty items", () => {
    const result = CursorPaginatedResponse.of([], 10, getId);

    expect(result.data).toEqual([]);
    expect(result.hasNext).toBe(false);
    expect(result.nextCursor).toBeNull();
  });
});
