import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseRepositoryBase } from '@database/repositories/mongoose.repository';
import { Model } from 'mongoose';

import { Grant } from '@schemas/grants.schema';
@Injectable()
export class GrantRepository extends MongooseRepositoryBase<Grant> {
  constructor(@InjectModel(Grant.name) private readonly grantModel: Model<Grant>) {
    super(grantModel);
  }
}
