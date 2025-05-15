import { Schema } from 'mongoose';

export const LikeSchema = new Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true },
  post_id: { type: String }, // Optional, only for post likes
  comment_id: { type: String }, // Optional, only for comment likes
  created_at: { type: Date, default: Date.now },
}); 