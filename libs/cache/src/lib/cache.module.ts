import { Module, type DynamicModule } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useFactory: (...args: any[]) => CacheModuleOptions | Promise<CacheModuleOptions>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
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
