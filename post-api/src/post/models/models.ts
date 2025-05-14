import { Schema } from 'mongoose';

export const PostSchema = new Schema({
  user_id: { type: String, required: true },
  text: { type: String, required: true },
  image_url: { type: String },
  created_at: { type: Date, default: Date.now },
}); 