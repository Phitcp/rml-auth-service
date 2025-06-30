import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, SetMetadata } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '../logger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';

export const REDIS_PREFIX_KEY = 'redis_key';
export interface RedisPrefix {
  prefix: string;
}
export const RedisPrefix = (meta: RedisPrefix) => SetMetadata(REDIS_PREFIX_KEY, meta);

@Injectable()
export class RedisInterceptor implements NestInterceptor {
  constructor(
    private readonly appLogger: AppLogger,
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // You can now use this.cacheManager to get/set cache
    const keyPrefix = this.reflector.get(REDIS_PREFIX_KEY, context.getHandler())

    // this.cacheManager.get()
    return next.handle().pipe(
      tap((res) => {
      }),
    );
  }
}