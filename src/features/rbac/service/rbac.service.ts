import { HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ResourcesRepository } from '@repositories/resources.repository';
import { RoleRepository } from '@repositories/role.repository';
import { UserRepository } from '@repositories/user.repository';
import { AppLogger } from '@shared/logger';

export class RBACService {
  constructor(
    private appLogger: AppLogger,
    private resourcesRepository: ResourcesRepository,
    private rolesRepository: RoleRepository,
    private userRepository: UserRepository,
  ) {}
  async checkPermission() {
    try {
      throw new Error('Not implemented');
    } catch (error) {
      this.appLogger.error(`RBAC check failed: ${error}`);
      throw new RpcException('RBAC check failed');
    }
  }

  async hasRole() {
    try {
    } catch (error) {
      this.appLogger.error(`RBAC check failed: ${error.message}`);
      throw new HttpException('RBAC check failed', 403);
    }
  }

  async getUserRoles() {
    try {
    } catch (error) {
      this.appLogger.error(`RBAC check failed: ${error.message}`);
      throw new RpcException('RBAC check failed');
    }
  }
}
