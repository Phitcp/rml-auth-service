import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Role extends Document {
  // Human-readable name of the role, e.g., "User", "Admin"
  @Prop({ required: true })
  role_name: string;

  // Slugified/unique identifier (used for permission lookups)
  @Prop({ required: true, unique: true })
  role_slug: string;

  // Optional description
  @Prop()
  description?: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
