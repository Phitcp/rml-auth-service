import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserRoles extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  // Context type (e.g., 'guild', 'global', 'team')
  @Prop({ required: true })
  context_type: string;

  // Context ID, e.g., guild_id
  @Prop({ type: Types.ObjectId, required: false })
  context_id?: Types.ObjectId;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRoles);
