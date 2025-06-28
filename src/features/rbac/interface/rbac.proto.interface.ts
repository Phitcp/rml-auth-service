/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "rbac";

export interface PermissionRequest {
  userId: string;
}

export interface PermissionResponse {
  allowed: boolean;
  reason: string;
  roles: string[];
  permissions: string[];
}

export interface UserRolesRequest {
  userId: string;
}

export interface UserRolesResponse {
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface RoleCheckRequest {
  userId: string;
  roleName: string;
}

export interface RoleCheckResponse {
  hasRole: boolean;
}

export const RBAC_PACKAGE_NAME = "rbac";

export interface RBACServiceClient {
  checkPermission(request: PermissionRequest): Observable<PermissionResponse>;

  getUserRoles(request: UserRolesRequest): Observable<UserRolesResponse>;

  hasRole(request: RoleCheckRequest): Observable<RoleCheckResponse>;
}

export const RBAC_SERVICE_NAME = "RBACService";
