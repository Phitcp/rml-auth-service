// rbac.controller.ts
import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RBACService } from '../service/rbac.service';
import { GrpcLogInterceptor } from '@shared/middlewares/grpc-log.interceptor';
import { GRPCExceptionFilter } from '@shared/exception-filter/grpc-exception-filter';
import {
  CreateResourcesRequest,
  CreateResourcesResponse,
  CreateRolesRequest,
  CreateRolesResponse,
  GrantAccessToRoleRequest,
  GrantAccessToRoleResponse,
  PermissionRequest,
  PermissionResponse,
  RoleCheckRequest,
  RoleCheckResponse,
  UserPermissionsRequest,
  UserPermissionsResponse,
} from '../interface/rbac.proto.interface';
import { getContext } from '@shared/decorator/context.decorator';
import { Metadata } from '@grpc/grpc-js';

@UseInterceptors(GrpcLogInterceptor)
@UseFilters(GRPCExceptionFilter)
@Controller()
export class RBACController {
  constructor(private readonly rbacService: RBACService) {}

  @GrpcMethod('RBACService', 'CheckPermission')
  checkPermission(
    data: PermissionRequest,
    metadata: Metadata,
  ): Promise<PermissionResponse> {
    return this.rbacService.checkPermission(getContext(metadata), data);
  }

  @GrpcMethod('RBACService', 'HasRole')
  hasRole(
    data: RoleCheckRequest,
    metadata: Metadata,
  ): Promise<RoleCheckResponse> {
    return this.rbacService.hasRole(getContext(metadata), data);
  }

  @GrpcMethod('RBACService', 'getUserPermissions')
  getUserPermissions(
    data: UserPermissionsRequest,
    metadata: Metadata,
  ): Promise<UserPermissionsResponse> {
    return this.rbacService.getUserPermissions(getContext(metadata), data);
  }

  @GrpcMethod('RBACService', 'CreateRole')
  async createRole(
    data: CreateRolesRequest,
    metadata: Metadata,
  ): Promise<CreateRolesResponse> {
    return await this.rbacService.createRole(getContext(metadata), data);
  }

  @GrpcMethod('RBACService', 'CreateResource')
  async createResource(
    data: CreateResourcesRequest,
    metadata: Metadata,
  ): Promise<CreateResourcesResponse> {
    return await this.rbacService.createResource(getContext(metadata), data);
  }

  @GrpcMethod('RBACService', 'GrantAccessToRole')
  async grantAccessToRole(
    data: GrantAccessToRoleRequest,
    metadata: Metadata,
  ): Promise<GrantAccessToRoleResponse> {
    return await this.rbacService.grantAccessToRole(getContext(metadata), data);
  }
}
