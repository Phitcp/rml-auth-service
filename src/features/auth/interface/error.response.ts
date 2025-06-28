import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class RegisterFailedError extends RpcException {
  constructor(errObject: { errorCode: number; details: string }) {
    super({
      error: errObject.errorCode || status.ALREADY_EXISTS,
      details: errObject.details || 'Register failed',
    });
  }
}

export class LoginFailedError extends RpcException {
  constructor(errObject: { errorCode: number; details: string }) {
    super({
      error: errObject.errorCode || status.UNAUTHENTICATED,
      details: errObject.details || 'Login failed',
    });
  }
}

export class RefreshTokenError extends RpcException {
  constructor(errObject: { errorCode: number; details: string }) {
    super({
      error: errObject.errorCode || status.UNKNOWN,
      details: errObject.details || 'Refresh token failed',
    });
  }
}
