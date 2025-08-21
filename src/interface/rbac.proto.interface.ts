
import { Observable } from "rxjs";

export interface UpdateGrantForRoleRequest {
  role: string;
  resource: string;
  actions: string[];
}

export interface UpdateGrantForRoleResponse {
  role: string;
  resource: string;
  actions: string[];
}

export interface DeleteGrantForRoleRequest {
  role: string;
  resource: string;
  actions: string[];
}

export interface DeleteGrantForRoleResponse {
  role: string;
  resource: string;
  actions: string[];
}

export interface CreateRolesRequest {
  role: string;
  description: string;
}

export interface CreateRolesResponse {
  role: string;
  description: string;
}

export interface CreateResourcesRequest {
  resource: string;
  description: string;
}

export interface CreateResourcesResponse {
  resource: string;
  description: string;
}

export interface GrantAccessToRoleRequest {
  role: string;
  resource: string;
  actions: string[];
}

export interface GrantAccessToRoleResponse {
  role: string;
  resource: string;
  actions: string[];
}

export interface PermissionRequest {
  userId: string;
  resource: string;
  action: string;
}

export interface PermissionResponse {
  allowed: boolean;
}

export interface UserPermissionsRequest {
  userId: string;
}

export interface UserPermissionsResponse {
  permissions: Role[];
}

export interface Role {
  resource: string;
  actions: string[];
}

export interface RoleCheckRequest {
  userId: string;
  roleName: string;
}

export interface RoleCheckResponse {
  hasRole: boolean;
}

export interface RBACServiceClient {
  checkPermission(request: PermissionRequest): Observable<PermissionResponse>;

  getUserPermissions(request: UserPermissionsRequest): Observable<UserPermissionsResponse>;

  hasRole(request: RoleCheckRequest): Observable<RoleCheckResponse>;

  createRole(request: CreateRolesRequest): Observable<CreateRolesResponse>;

  createResource(request: CreateResourcesRequest): Observable<CreateResourcesResponse>;

  grantAccessToRole(request: GrantAccessToRoleRequest): Observable<GrantAccessToRoleResponse>;

  updateGrantForRole(request: UpdateGrantForRoleRequest): Observable<UpdateGrantForRoleResponse>;

  deleteGrantForRole(request: DeleteGrantForRoleRequest): Observable<DeleteGrantForRoleResponse>;
}

export interface RBACServiceController {
  checkPermission(
    request: PermissionRequest,
  ): Promise<PermissionResponse> | Observable<PermissionResponse> | PermissionResponse;

  getUserPermissions(
    request: UserPermissionsRequest,
  ): Promise<UserPermissionsResponse> | Observable<UserPermissionsResponse> | UserPermissionsResponse;

  hasRole(request: RoleCheckRequest): Promise<RoleCheckResponse> | Observable<RoleCheckResponse> | RoleCheckResponse;

  createRole(
    request: CreateRolesRequest,
  ): Promise<CreateRolesResponse> | Observable<CreateRolesResponse> | CreateRolesResponse;

  createResource(
    request: CreateResourcesRequest,
  ): Promise<CreateResourcesResponse> | Observable<CreateResourcesResponse> | CreateResourcesResponse;

  grantAccessToRole(
    request: GrantAccessToRoleRequest,
  ): Promise<GrantAccessToRoleResponse> | Observable<GrantAccessToRoleResponse> | GrantAccessToRoleResponse;

  updateGrantForRole(
    request: UpdateGrantForRoleRequest,
  ): Promise<UpdateGrantForRoleResponse> | Observable<UpdateGrantForRoleResponse> | UpdateGrantForRoleResponse;

  deleteGrantForRole(
    request: DeleteGrantForRoleRequest,
  ): Promise<DeleteGrantForRoleResponse> | Observable<DeleteGrantForRoleResponse> | DeleteGrantForRoleResponse;
}
