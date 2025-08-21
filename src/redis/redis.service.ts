import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

export interface BulkGetOrSetStringKeyInterface {
  suffixes: string[];
  prefix: string;
  callback: () => Promise<any[]>;
  ttl?: number;
}
@Injectable()
export class RedisService {
  private redisClient: Redis;
  constructor() {
    this.redisClient = new Redis({
      host: '127.0.0.1',
      port: 6379,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.redisClient.set(key, stringValue, 'EX', ttl);
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  async getOrSet<K extends () => Promise<any>>(
    key: string,
    callback: K,
    ttl?: number,
  ): Promise<Awaited<ReturnType<K>>> {
    const cachedData = await this.get<Awaited<ReturnType<K>>>(key);
    if (cachedData !== null) {
      return cachedData;
    }

    const freshData = await callback();
    await this.set(key, freshData, ttl);
    return freshData as Awaited<ReturnType<K>>;
  }

  async bulkStringKeyGetOrSet<K extends () => Promise<any[]>>({
    suffixes,
    prefix,
    callback,
    ttl,
  }: BulkGetOrSetStringKeyInterface & { callback: K }): Promise<Awaited<ReturnType<K>>> {
    const cachedData = await Promise.all(
      suffixes.map((suffix) => this.get<Awaited<ReturnType<K>>[number]>(`${prefix}${suffix}`)),
    );
    const keysToFetch = suffixes.filter((_, index) => cachedData[index] === null);

    if (keysToFetch.length === 0) {
      return cachedData as Awaited<ReturnType<K>>;
    }

    const freshData = await callback();
    await Promise.all(
      keysToFetch.map((suffix, index) => this.set(`${prefix}${suffix}`, freshData[index], ttl)),
    );
    return freshData as Awaited<ReturnType<K>>;
  }

  get client(): Redis {
    return this.redisClient;
  }
}
