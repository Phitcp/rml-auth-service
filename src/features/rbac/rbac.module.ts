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

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Resource.name, schema: ResourceSchema},
      {name: Role.name, schema: RoleSchema},
      {name: User.name, schema: UserSchema}
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
    AppLogger
  ]
})
export class RBACModule {}
