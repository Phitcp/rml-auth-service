import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '../logger';

@Injectable()
export class GrpcLogInterceptor implements NestInterceptor {
  constructor(private readonly appLogger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'rpc') {
      const handler = context.getHandler().name;
      const className = context.getClass().name;
      const metadata = context.getArgByIndex(1).getMap()
      this.appLogger
        .addLogContext(metadata['x-trace-id'])
        .addMsgParam('Hit gRPC server')
        .log(`[gRPC] ${className}.${handler} called`);
    }
    return next.handle().pipe(
      tap(() => {
        // Optionally log response or timing here
      }),
    );
  }
}
