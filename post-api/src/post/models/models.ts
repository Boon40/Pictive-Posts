import { Schema, Types } from 'mongoose';

export const PostSchema = new Schema({
  user_id: { type: Types.ObjectId, required: true, ref: 'User' },
  text: { type: String, required: true },
  image_url: { type: String },
  created_at: { type: Date, default: Date.now },
}); 