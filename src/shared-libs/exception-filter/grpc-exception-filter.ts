import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { throwError, Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status, Metadata } from '@grpc/grpc-js';
import { AppLogger } from '../logger';

@Catch(RpcException)
export class GRPCExceptionFilter implements RpcExceptionFilter<RpcException> {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    const metadata = ctx.getContext().getMap();
    const traceId = metadata['x-trace-id'];
    this.logger.addLogContext(traceId).addMsgParam('gRPC Error');

    let errorObject: any = exception.getError();

    // Gracefully parse the error
    const isRpcException = exception instanceof RpcException;
    if (!isRpcException || !errorObject) {
      errorObject = {
        statusCode: 500,
        error: 'INTERNAL_ERROR',
        message: 'Unhandled error occurred',
        details: data,
      };
    }

    // Build metadata to send back to the API Gateway
    const errorMeta = new Metadata();
    if (errorObject?.error) {
      errorMeta.set('error_code', errorObject.error);
    }
    if (errorObject?.details) {
      errorMeta.set('details', errorObject.details);
    }

    const grpcError = {
      code: errorObject?.error || status.UNKNOWN,
      message: errorObject?.details || 'Internal Server Error',
      metadata: errorMeta,
    };

    this.logger.error(JSON.stringify(grpcError));

    return throwError(() => grpcError);
  }
}
