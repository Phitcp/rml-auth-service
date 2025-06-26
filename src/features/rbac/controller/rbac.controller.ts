// rbac.controller.ts
import { Controller, Logger } from '@nestjs/common';
import {
  GrpcMethod,
  RpcException,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { truncate } from 'fs/promises';

@Controller()
export class RBACController {
  private readonly logger = new Logger(RBACController.name);

  @GrpcMethod('RBACService', 'CheckPermission')
  checkPermission(data: { userId: string }) {
    try {
      //   // Your RBAC logic here
      //   const userRoles = this.getUserRoles(data.userId);
      //   const hasPermission = this.evaluatePermission(
      //     userRoles,
      //     data.resource,
      //     data.action,
      //     data.context,
      //   );

        return {
          allowed: true,
          reason: 'Granted',
          roles: ['user'],
          permissions: ['yes']
        };
      console.log(data);
      return true;
    } catch (error) {
      this.logger.error(`RBAC check failed: ${error.message}`);
      throw new RpcException({
        code: status.INTERNAL,
        message: 'RBAC check failed',
      });
    }
  }

  @GrpcMethod('RBACService', 'HasRole')
  hasRole(data: { userId: string; roleName: string }) {
    try {
      const userRoles = this.getUserRoles(data.userId);
      const hasRole = userRoles.some((role) => role.name === data.roleName);

      return { hasRole };
    } catch (err) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
        stack: JSON.stringify(err),
      });
    }
  }

  getUserRoles(userId: string) {
    console.log(userId);
    // Implementation to fetch user roles
    return [{ name: 'a' }, { name: 'a' }];
  }

  evaluatePermission(roles, resource, action, context) {
    console.log(roles);
    console.log(resource);
    console.log(action);
    console.log(context);
    return true;
    // Implementation to check permissions
  }

  private extractPermissions(roles) {
    console.log(roles);
    // Implementation to extract permissions from roles
  }
}
