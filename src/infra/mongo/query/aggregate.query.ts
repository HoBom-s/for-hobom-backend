import { MemoryCache } from "../../cache/memory.cache";
import { AggregateResultQuery } from "./aggregate-result.query";

export class AggregateQuery<T> {
  private memoryCache: MemoryCache<T | T[]> = MemoryCache.of<T | T[]>();

  constructor() {}

  public static of<T>(ttlMs: number = 30000): AggregateQuery<T> {
    const query = new AggregateQuery<T>();
    query.memoryCache.setTTLMs(ttlMs);

    return query;
  }

  public async fetch(
    key: string,
    aggregateQuery: () => Promise<T[]>,
  ): Promise<T | null> {
    const cached = this.memoryCache.get(key);
    if (cached != null) {
      return cached as T;
    }

    const result =
      await AggregateResultQuery.fetchSingleResult(aggregateQuery());
    if (result == null) {
      return null;
    }
    this.memoryCache.set(key, result);

    return result;
  }

  public async fetchAll(
    key: string,
    aggregateQuery: () => Promise<T[]>,
  ): Promise<T[]> {
    const cached = this.memoryCache.get(key);
    if (cached != null) {
      return cached as T[];
    }

    const result =
      await AggregateResultQuery.fetchMultipleResult(aggregateQuery());
    this.memoryCache.set(key, result);

    return result;
  }

  public get cache(): MemoryCache<T | T[]> {
    return this.memoryCache;
  }
}
