import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    Redis,
    RedisService,
  ],
  exports: [
    RedisService
  ]
})
export class RedisModule {}
