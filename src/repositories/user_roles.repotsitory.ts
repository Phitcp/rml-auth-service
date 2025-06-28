import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseRepositoryBase } from '@database/repositories/mongoose.repository';
import { Model } from 'mongoose';
// Todo: This schema will be used in the future when there's chatroom - guild feature
import { UserRoles } from '@schemas/user_roles.schema';
@Injectable()
export class UserRolesRepository extends MongooseRepositoryBase<UserRoles> {
  constructor(@InjectModel(UserRoles.name) private readonly userRolesModel: Model<UserRoles>) {
    super(userRolesModel);
  }
}
