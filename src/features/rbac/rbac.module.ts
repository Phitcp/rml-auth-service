// app.module.ts (API Gateway)
import { Module } from '@nestjs/common';
import { RBACController } from './controller/rbac.controller';
import { ResourcesRepository } from '@repositories/resources.repository';
import { RoleRepository } from '@repositories/role.repository';
import { UserRepository } from '@repositories/user.repository';
import { RBACService } from './service/rbac.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Resource, ResourceSchema } from '@schemas/resources.schema';
import { Role, RoleSchema } from '@schemas/role.schema';
import { User, UserSchema } from '@schemas/user.schema';
import { AppLogger } from '@shared/logger';
import { Grant, GrantSchema } from '@schemas/grants.schema';
import { GrantRepository } from '@repositories/grant.repository';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Resource.name, schema: ResourceSchema},
      {name: Role.name, schema: RoleSchema},
      {name: User.name, schema: UserSchema},
      {name: Grant.name, schema: GrantSchema}
    ]),
    CacheModule.register({
      store: redisStore as any,
      host: 'localhost',
      port: 6379,
      ttl: 60
    }),
  ],
  controllers: [
    RBACController
  ],
  providers: [
    ResourcesRepository,
    RoleRepository,
    UserRepository,
    RBACService,
    AppLogger,
    GrantRepository
  ]
})
export class RBACModule {}
