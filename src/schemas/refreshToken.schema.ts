import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 } from 'uuid';

@Schema()
export class RefreshToken extends Document {
  @Prop({ ref: 'User' })
  userId: string;

  @Prop() // the current token's hash
  tokenHash: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  expiresAt: Date;

  @Prop({ type: [String], default: [] })
  usedTokenHashes: string[]; // hashed used tokens

  @Prop({ default: () => v4() })
  sessionId: string; // use to identify session
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
