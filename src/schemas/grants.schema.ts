import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Grant extends Document {
  // Foreign key to Role
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  @Prop({ required: true })
  role_slug: string;

  @Prop({ required: true })
  resource_slug: string;
  
  // Foreign key to Resource
  @Prop({ type: Types.ObjectId, ref: 'Resource', required: true })
  resource: Types.ObjectId;

  // Actions granted: read:own, read:all, update:own, update:all
  @Prop({ type: [String], default: [] })
  actions: string[];
}

export const GrantSchema = SchemaFactory.createForClass(Grant);
