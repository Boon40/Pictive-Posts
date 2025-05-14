import { Schema } from 'mongoose';

export const CommentSchema = new Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true },
  post_id: { type: String }, // Optional, only for top-level comments
  parent_comment_id: { type: String }, // Optional, only for replies
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
}); 