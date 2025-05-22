import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Post extends Document {
  @Prop({ required: true })
  declare _id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  text: string;

  @Prop()
  image_url?: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post); 