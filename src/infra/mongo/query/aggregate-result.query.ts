export class AggregateResultQuery {
  public static async fetchSingleResult<T>(
    aggregateQuery: Promise<T[]>,
  ): Promise<T | null> {
    const result = await aggregateQuery;
    if (result == null || result.length === 0) {
      return null;
    }

    return result[0];
  }

  public static async fetchMultipleResult<T>(
    aggregateQuery: Promise<T[]>,
  ): Promise<T[]> {
    const result = await aggregateQuery;
    if (result == null || result.length === 0) {
      return [];
    }

    return result;
  }
}
