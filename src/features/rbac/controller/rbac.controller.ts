// rbac.controller.ts
import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RBACService } from '../service/rbac.service';
import { GrpcLogInterceptor } from '@shared/middlewares/grpc-log.interceptor';
import { GRPCExceptionFilter } from '@shared/exception-filter/grpc-exception-filter';

@UseInterceptors(GrpcLogInterceptor)
@UseFilters(GRPCExceptionFilter)
@Controller()
export class RBACController {
  constructor(private readonly rbacService: RBACService) {}

  @GrpcMethod('RBACService', 'CheckPermission')
  checkPermission() {
    return this.rbacService.checkPermission();
  }

  @GrpcMethod('RBACService', 'HasRole')
  hasRole() {
    return this.rbacService.hasRole();
  }

  @GrpcMethod('RBACService', 'GetUserRoles')
  getUserRoles() {
    return this.rbacService.getUserRoles();
    }
}
