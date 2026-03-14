import { ApiProperty } from "@nestjs/swagger";

export class GetDlqListDto {
  @ApiProperty({ type: [String] })
  items: string[];

  constructor(data: Partial<GetDlqListDto>) {
    Object.assign(this, data);
  }

  public static from(result: { items: string[] }): GetDlqListDto {
    return new GetDlqListDto({ items: result.items });
  }
}

export class GetDlqDetailDto {
  @ApiProperty({ type: String })
  key: string;

  @ApiProperty({ type: Object })
  payload: Record<string, unknown>;

  constructor(data: Partial<GetDlqDetailDto>) {
    Object.assign(this, data);
  }

  public static from(
    key: string,
    result: { item: Record<string, unknown> },
  ): GetDlqDetailDto {
    return new GetDlqDetailDto({ key, payload: result.item });
  }
}

export class RetryDlqDto {
  @ApiProperty({ type: String })
  message: string;

  constructor(data: Partial<RetryDlqDto>) {
    Object.assign(this, data);
  }

  public static from(result: { message: string }): RetryDlqDto {
    return new RetryDlqDto({ message: result.message });
  }
}
