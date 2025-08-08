import { RedisService } from './../../redis/redis.service';
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

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Resource.name, schema: ResourceSchema},
      {name: Role.name, schema: RoleSchema},
      {name: User.name, schema: UserSchema},
      {name: Grant.name, schema: GrantSchema}
    ])
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
    GrantRepository,
  ]
})
export class RBACModule {}
