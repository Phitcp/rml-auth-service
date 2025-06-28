import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseRepositoryBase } from '@database/repositories/mongoose.repository';
import { Model } from 'mongoose';
import { Resource } from '@schemas/resources.schema';
@Injectable()
export class ResourcesRepository extends MongooseRepositoryBase<Resource> {
  constructor(@InjectModel(Resource.name) private readonly resourceModel: Model<Resource>) {
    super(resourceModel);
  }
}
