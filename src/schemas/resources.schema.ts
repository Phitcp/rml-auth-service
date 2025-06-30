import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Resource extends Document {
  // e.g., 'user', 'character', 'post'
  @Prop({ required: true, unique: true })
  resource_name: string;

  @Prop({ required: true, unique: true })
  resource_slug: string;
  // Optional description
  @Prop()
  description?: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
