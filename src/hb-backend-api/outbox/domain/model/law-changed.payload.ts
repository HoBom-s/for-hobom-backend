export interface LawChangedPayload {
  diffId: string;
  changes: {
    articleNo: string;
    changeType: string;
    before: string;
    after: string;
  }[];
}

export function createLawChangedPayload(
  input: LawChangedPayload,
): Record<string, unknown> {
  return {
    diffId: input.diffId,
    changes: input.changes,
  };
}
