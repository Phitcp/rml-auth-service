import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseRepositoryBase } from '@database/repositories/mongoose.repository';
import { Model } from 'mongoose';
import { RefreshToken } from '@schemas/refreshToken.schema';
@Injectable()
export class RefreshTokenRepository extends MongooseRepositoryBase<RefreshToken> {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
  ) {
    super(refreshTokenModel);
  }
}
