import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@schemas/user.schema';
import { MongooseRepositoryBase } from '@database/repositories/mongoose.repository';
import { Model } from 'mongoose';
import { Role } from '@root/interface/rbac.proto.interface';
@Injectable()
export class UserRepository extends MongooseRepositoryBase<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }

  async getRoleListForUser(userId: string): Promise<Role[]> {
    const aggregateQuery = [
      {
        $match: {
          userId,
        },
      },
      {
        $project: {
          role: 1,
        },
      },
      {
        $lookup: {
          from: 'grants',
          localField: 'role',
          foreignField: 'role',
          as: 'grants',
        },
      },
      {
        $unwind: {
          path: '$grants',
        },
      },
      {
        $project: {
            _id: 0,
          resource: '$grants.resource',
          actions: '$grants.actions',
        },
      },
    ];
    const roles = await this.userModel.aggregate(aggregateQuery);
    return roles as Role[];
  }
}
