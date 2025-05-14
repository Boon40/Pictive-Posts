import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostSchema } from '../models/models';

@Injectable()
export class PostRepository {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<any>
  ) {}

  async createPost(data: any) {
    const post = new this.postModel(data);
    return post.save();
  }

  async getPostsByUserId(userId: string) {
    return this.postModel.find({ user_id: userId }).sort({ created_at: -1 }).exec();
  }

  async getPostsByUserIds(userIds: string[]) {
    return this.postModel.find({ user_id: { $in: userIds } }).sort({ created_at: -1 }).exec();
  }

  async deletePost(postId: string) {
    return this.postModel.findByIdAndDelete(postId).exec();
  }
}
