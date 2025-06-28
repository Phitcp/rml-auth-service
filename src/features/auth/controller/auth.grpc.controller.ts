import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from '@auth/service/auth.service';
import { RefreshTokenService } from '@auth/service/refresh-token.service';
import { Metadata } from '@grpc/grpc-js';
import { getContext } from '@shared/decorator/context.decorator';
import { GrpcLogInterceptor } from '@shared/middlewares/grpc-log.interceptor';
import { GRPCExceptionFilter } from '@shared/exception-filter/grpc-exception-filter';

@UseInterceptors(GrpcLogInterceptor)
@UseFilters(GRPCExceptionFilter)
@Controller()
export class AuthGrpcController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}
 
  @GrpcMethod('AuthService', 'Register')
  async register(data: any, metadata: Metadata) {
    return this.authService.registerUser(getContext(metadata), data);
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: any, metadata: Metadata) {
    return this.authService.login(getContext(metadata), data);
  }

  @GrpcMethod('AuthService', 'RotateToken')
  async rotateToken(data: any, metadata: Metadata) {
    return this.refreshTokenService.rotateToken(getContext(metadata), data);
  }

  @GrpcMethod('AuthService', 'GetUserTokens')
  async getUserTokens(data: any, metadata: Metadata) {
    return this.refreshTokenService.getTokenForUser( getContext(metadata), data);
  }
}
