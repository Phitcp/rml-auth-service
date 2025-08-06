import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Grant extends Document {
  // Foreign key to Role

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  resource: string;
  
  // Actions granted: read:own, read:all, update:own, update:all
  @Prop({ type: [String], default: [] })
  actions: string[];
}

export const GrantSchema = SchemaFactory.createForClass(Grant);
