/**
 * 일관된 Response 를 응답하기 위한 `ResponseEntity` 객체 정의
 *
 * @example
 *      ResponseEntity.ok()
 *      ResponseEntity.fail()
 */
export class ResponseEntity<T> {
  private constructor(
    private readonly success: boolean,
    private readonly item: T | null,
    private readonly message: string | null,
    private readonly timestamp: string,
  ) {
    this.success = success;
    this.item = item;
    this.message = message;
    this.timestamp = timestamp;
  }

  public static ok<T>(data: T): ResponseEntity<T> {
    return new ResponseEntity<T>(true, data, "OK !", new Date().toISOString());
  }

  public static fail<T>(data?: T): ResponseEntity<T> {
    return new ResponseEntity<T>(
      false,
      data ?? null,
      "FAIL !",
      new Date().toISOString(),
    );
  }
}
