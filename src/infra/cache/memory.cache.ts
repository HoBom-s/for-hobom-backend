export class MemoryCache<T> {
  private store = new Map<string, { value: T | T[]; expires: number }>();

  constructor(
    private ttlMs: number = 30000,
    private readonly maxEntries: number = 1000,
  ) {
    this.maxEntries = maxEntries;
  }

  public static of<T>(
    ttlMs: number = 30000,
    maxEntries: number = 1000,
  ): MemoryCache<T> {
    return new MemoryCache<T>(ttlMs, maxEntries);
  }

  public get(key: string): T | T[] | null {
    const entry = this.store.get(key);
    if (entry == null || entry.expires < Date.now()) {
      this.store.delete(key);
      return null;
    }

    // LRU -> ( Lease Recently Used )
    this.store.delete(key);
    this.store.set(key, entry);

    return entry.value;
  }

  public set(key: string, value: T | T[]): void {
    if (this.store.size >= this.maxEntries) {
      // LRU delete
      const oldestKey = String(this.store.keys().next().value);
      this.store.delete(oldestKey);
    }

    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }

  public setTTLMs(ttlMs: number): void {
    this.ttlMs = ttlMs;
  }

  public invalidate(key: string): void {
    this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }
}
