import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseRepositoryBase } from '@database/repositories/mongoose.repository';
import { Model } from 'mongoose';
import { Resource } from '@schemas/resources.schema';
import { Role } from '@schemas/role.schema';
@Injectable()
export class RoleRepository extends MongooseRepositoryBase<Role> {
  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>) {
    super(roleModel);
  }
}
