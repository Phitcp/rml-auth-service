// shared-libs/src/mongo/repositories/mongoose.repository.ts
import { Model, ClientSession, FilterQuery, UpdateQuery } from 'mongoose';
import { BaseDocument } from '../interfaces/base-document.interface';

export class MongooseRepositoryBase<T extends BaseDocument> {
  constructor(protected readonly model: Model<T>) {}

  async createOne(doc: Partial<T>, session?: ClientSession): Promise<T> {
    const result = await this.model.create(
      [{ ...doc }],
      session ? { session } : {},
    );
    return result[0];
  }

  async createMany(docs: Partial<T>[], session?: ClientSession): Promise<T[]> {
    const options = session ? { session } : {};
    const result = await this.model.insertMany(docs, options);
    return result as any as T[];
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findMany(filter: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, update, { new: true, session })
      .exec();
  }

  async deleteOne(
    filter: FilterQuery<T>,
    session?: ClientSession,
  ): Promise<T | null> {
    return this.model.findOneAndDelete(filter, { session }).exec();
  }

  async deleteMany(filter: FilterQuery<T>, session?: ClientSession) {
    return this.model.deleteMany(filter, { session }).exec();
  }

  async startTransaction(): Promise<ClientSession> {
    const session = await this.model.db.startSession();
    session.startTransaction();
    return session;
  }

  async commitTransaction(session: ClientSession) {
    await session.commitTransaction();
    await session.endSession();
  }

  async abortTransaction(session: ClientSession) {
    await session.abortTransaction();
    await session.endSession();
  }
}
