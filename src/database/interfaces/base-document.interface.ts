// shared-libs/src/mongo/interfaces/base-document.interface.ts
import { Document } from 'mongoose';

export interface BaseDocument extends Document {
  createdAt?: Date;
  updatedAt?: Date;
}
