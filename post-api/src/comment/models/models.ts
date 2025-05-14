import { Schema, Types } from 'mongoose';

export const CommentSchema = new Schema({
  user_id: { type: Types.ObjectId, required: true, ref: 'User' },
  post_id: { type: Types.ObjectId, required: true, ref: 'Post' },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
}); 