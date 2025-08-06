import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Resource extends Document {
  @Prop({ required: true, unique: true })
  resource: string;
  // Optional description
  @Prop()
  description?: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
