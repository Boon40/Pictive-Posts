import { Schema, Types } from 'mongoose';

export const CommentLikeSchema = new Schema({
  comment_id: { type: Types.ObjectId, required: true, ref: 'Comment' },
  user_id: { type: Types.ObjectId, required: true, ref: 'User' },
  created_at: { type: Date, default: Date.now },
}); 