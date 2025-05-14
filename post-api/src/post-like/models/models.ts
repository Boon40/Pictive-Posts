import { Schema, Types } from 'mongoose';

export const PostLikeSchema = new Schema({
  post_id: { type: Types.ObjectId, required: true, ref: 'Post' },
  user_id: { type: Types.ObjectId, required: true, ref: 'User' },
  created_at: { type: Date, default: Date.now },
}); 