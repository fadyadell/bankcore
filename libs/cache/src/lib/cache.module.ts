import { Module, type DynamicModule } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service.js';

export interface CacheModuleOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTtl?: number;
}

@Module({})
export class CacheModule {
  static forRoot(options: CacheModuleOptions): DynamicModule {
    return {
      module: CacheModule,
      global: true,
      providers: [
        {
          provide: 'CACHE_MODULE_OPTIONS',
          useValue: options,
        },
        RedisCacheService,
      ],
      exports: [RedisCacheService],
    };
  }

  static forRootAsync(optionsFactory: {
    useFactory: (...args: unknown[]) => CacheModuleOptions | Promise<CacheModuleOptions>;
    inject?: unknown[];
  }): DynamicModule {
    return {
      module: CacheModule,
      global: true,
      providers: [
        {
          provide: 'CACHE_MODULE_OPTIONS',
          useFactory: optionsFactory.useFactory,
          inject: optionsFactory.inject || [],
        },
        RedisCacheService,
      ],
      exports: [RedisCacheService],
    };
  }
}
