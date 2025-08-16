import { RedisService } from './../../../redis/redis.service';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ResourcesRepository } from '@repositories/resources.repository';
import { RoleRepository } from '@repositories/role.repository';
import { UserRepository } from '@repositories/user.repository';
import { AppLogger } from '@shared/logger';
import { ModifiedRolesFailedError, NoPermissionError } from '@interface/error.response';
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
} from '../../../interface/rbac.proto.interface';
import { GrantRepository } from '@repositories/grant.repository';
import { AppContext } from '@shared/decorator/context.decorator';
import { basename } from 'path';
import { PerMissionList_Prefix } from '@root/redis/constant'; 
@Injectable()
export class RBACService {
  constructor(
    private appLogger: AppLogger,
    private resourcesRepository: ResourcesRepository,
    private rolesRepository: RoleRepository,
    private grantsRepository: GrantRepository,
    private userRepository: UserRepository,
    private redisClient: RedisService,
  ) {}
  async checkPermission(
    context: AppContext,
    payload: PermissionRequest,
  ): Promise<PermissionResponse> {
    try {
      this.appLogger
        .addLogContext(context.traceId)
        .addMsgParam(basename(__filename))
        .addMsgParam('checkPermission')
        .log(
          `Will check permission for user ${payload.userId}:: resource ${payload.resource}:: action ${payload.action}`,
        );
      const userPermissions = await this.getUserPermissions(context, payload);

      const allowResource = userPermissions.permissions.find(
        (per) => (per.resource === payload.resource),
      );

      if (!allowResource) {
        this.appLogger.log(
          `Did check permission, user have no access to this resource`,
        );
        return {
          allowed: false,
        };
      }
      const isAllow = allowResource.actions.includes(payload.action);
      this.appLogger.log(
        `Did check permission, user can access to this resource`,
      );
      return {
        allowed: isAllow,
      };
    } catch (error) {
      this.appLogger.error(`RBAC check failed: ${JSON.stringify(error)}`);
      throw new RpcException('RBAC check failed');
    }
  }

  async hasRole(
    context: AppContext,
    payload: RoleCheckRequest,
  ): Promise<RoleCheckResponse> {
    try {
      throw new Error('Not implemented');
    } catch (error) {
      this.appLogger.error(`RBAC check failed: ${error.message}`);
      throw new HttpException('RBAC check failed', 403);
    }
  }

  async getUserPermissions(
    context: AppContext,
    payload: UserPermissionsRequest,
  ): Promise<UserPermissionsResponse> {
    try {
      this.appLogger
        .addLogContext(context.traceId)
        .addMsgParam(basename(__filename))
        .addMsgParam('getUserPermissions')
        .log('Will get permission list for user');

      const cacheData = await this.redisClient.get<UserPermissionsResponse>(`${PerMissionList_Prefix}${payload.userId}`);

      if (cacheData) {
        this.appLogger.log('Did return permission list from cache');
        return cacheData;
      }
      
      const user = await this.userRepository.findOne({
        userId: payload.userId,
      });

      if (!user) {
        this.appLogger.error(`RBAC check failed: User not found`);
        throw new RpcException('User not found');
      }

      const userPermissions = await this.userRepository.getRoleListForUser(
        user.userId,
      );
 
      const response = {
        permissions: userPermissions,
      };

      this.appLogger.log('Did get permission list for user');
      this.redisClient.set(`${PerMissionList_Prefix}${payload.userId}`, response, 24 * 60 * 60); // cache user permission for 1 day
      return response;
    } catch (error) {
      this.appLogger.error(`RBAC check failed: ${JSON.stringify(error)}`);
      throw new NoPermissionError();
    }
  }

  async createRole(
    context: AppContext,
    payload: CreateRolesRequest,
  ): Promise<CreateRolesResponse> {
    try {
      this.appLogger
        .addLogContext(context.traceId)
        .addMsgParam(basename(__filename))
        .addMsgParam('createRole')
        .log(`Will create role: ${payload.role}`);

      const newRole = await this.rolesRepository.createOne({
        role: payload.role,
        description: payload.description,
      });

      this.appLogger.log('Did create role success');
      return {
        role: newRole.role,
        description: newRole.description ?? '',
      };
    } catch (error) {
      this.appLogger.error(`RBAC create role failed: ${error}`);
      throw new ModifiedRolesFailedError();
    }
  }

  async createResource(
    context: AppContext,
    payload: CreateResourcesRequest,
  ): Promise<CreateResourcesResponse> {
    try {
      this.appLogger
        .addLogContext(context.traceId)
        .addMsgParam(basename(__filename))
        .addMsgParam('createResource')
        .log(`Will create resource: ${payload.resource}`);
      const newResource = await this.resourcesRepository.createOne({
        resource: payload.resource,
        description: payload.description,
      });
      this.appLogger.log('Did create resource success');
      return {
        resource: newResource.resource,
        description: newResource.description ?? '',
      };
    } catch (error) {
      this.appLogger.error(`RBAC create resource failed: ${error.message}`);
      throw new ModifiedRolesFailedError();
    }
  }
  
  async grantAccessToRole(
    context: AppContext,
    payload: GrantAccessToRoleRequest,
  ): Promise<GrantAccessToRoleResponse> {
    try {
      this.appLogger
        .addLogContext(context.traceId)
        .addMsgParam(basename(__filename))
        .addMsgParam('grantAccessToRole')
        .log(
          `Will grant access to role: ${payload.role} for resource: ${payload.resource} with actions: ${payload.actions.join(', ')}`,
        );
      const foundResource = await this.resourcesRepository.findOne({
        resource: payload.resource,
      });
      if (!foundResource) {
        this.appLogger.error(`RBAC grant access failed: Resource not found`);
        throw new ModifiedRolesFailedError();
      }

      const foundRole = await this.rolesRepository.findOne({
        role: payload.role,
      });
      if (!foundRole) {
        this.appLogger.error(`RBAC grant access failed: Role not found`);
        throw new ModifiedRolesFailedError();
      }
      const newGrant = await this.grantsRepository.createOne({
        role: foundRole.role,
        resource: foundResource.resource,
        actions: payload.actions,
      });
      this.appLogger.log('Did grant access to role success');
      return {
        role: newGrant.role,
        resource: newGrant.resource,
        actions: newGrant.actions,
      };
    } catch (error) {
      this.appLogger.error(`RBAC grant access failed: ${error.message}`);
      throw new ModifiedRolesFailedError();
    }
  }

  async updateGrantForRole(
    context: AppContext,
    payload: GrantAccessToRoleRequest,
  ): Promise<GrantAccessToRoleResponse> {
    try {
      this.appLogger
        .addLogContext(context.traceId)
        .addMsgParam(basename(__filename))
        .addMsgParam('updateGrantForRole')
        .log(
          `Will update grant for role: ${payload.role} for resource: ${payload.resource} with actions: ${payload.actions.join(', ')}`,
        );

      const foundResource = await this.resourcesRepository.findOne({
        resource_name: payload.resource,
      });
      if (!foundResource) {
        this.appLogger.error(`RBAC grant access failed: Resource not found`);
        throw new ModifiedRolesFailedError();
      }

      const foundRole = await this.rolesRepository.findOne({
        role_name: payload.role,
      });
      if (!foundRole) {
        this.appLogger.error(`RBAC grant access failed: Role not found`);
        throw new ModifiedRolesFailedError();
      }

      const existingGrant = await this.grantsRepository.findOne({
        role: foundRole._id,
        resource: foundResource._id,
      });

      if (!existingGrant) {
        this.appLogger.error(`RBAC grant access failed: Grant not found`);
        throw new ModifiedRolesFailedError();
      }

      existingGrant.actions = payload.actions;
      await existingGrant.save();
      return {
        role: existingGrant.role,
        resource: existingGrant.resource,
        actions: existingGrant.actions,
      };
    } catch (error) {
      this.appLogger.error(`RBAC update grant failed: ${error.message}`);
      throw new ModifiedRolesFailedError();
    }
  }
}
