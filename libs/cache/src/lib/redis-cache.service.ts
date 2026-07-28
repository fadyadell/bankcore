import {
  Injectable,
  Inject,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'ioredis';
import type { CacheModuleOptions } from './cache.module.js';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private client!: Redis;
  private readonly defaultTtl: number;
  private readonly keyPrefix: string;

  constructor(
    @Inject('CACHE_MODULE_OPTIONS') private readonly options: CacheModuleOptions,
  ) {
    this.defaultTtl = options.defaultTtl || 300;
    this.keyPrefix = options.keyPrefix || 'bankcore:';
  }

  async onModuleInit(): Promise<void> {
    this.client = new Redis({
      host: this.options.host,
      port: this.options.port,
      password: this.options.password,
      db: this.options.db || 0,
      keyPrefix: this.keyPrefix,
      retryStrategy: (times: number) => {
        if (times > 5) {
          this.logger.error('Redis connection failed after 5 retries');
          return null;
        }
        return Math.min(times * 500, 3000);
      },
      lazyConnect: false,
    });

    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (err: Error) => this.logger.error(`Redis error: ${err.message}`));
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    this.logger.log('Redis disconnected');
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const expiry = ttl || this.defaultTtl;

    await this.client.setex(key, expiry, serialized);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      const pipeline = this.client.pipeline();
      for (const key of keys) {
        const unprefixed = key.startsWith(this.keyPrefix)
          ? key.slice(this.keyPrefix.length)
          : key;
        pipeline.del(unprefixed);
      }
      await pipeline.exec();
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async increment(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  getClient(): Redis {
    return this.client;
  }
}
