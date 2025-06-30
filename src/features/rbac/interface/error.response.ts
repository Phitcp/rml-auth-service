import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class ModifiedRolesFailedError extends RpcException {
  constructor(
    errObject = {
      errorCode: status.INTERNAL,
      details: 'Failed to modify roles',
    },
  ) {
    super({
      error: errObject.errorCode || status.INTERNAL,
      details: errObject.details || 'Failed to modify roles',
    });
  }
}
