import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true })
  role: string;

  // Optional description
  @Prop()
  description?: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
