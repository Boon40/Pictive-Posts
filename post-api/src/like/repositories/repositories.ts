import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikeSchema } from '../models/models';

@Injectable()
export class LikeRepository {
  constructor(
    @InjectModel('Like') private readonly likeModel: Model<any>
  ) {}

  async createLike(data: any) {
    if (!data._id) {
      data._id = Math.random().toString(36).substring(2, 15);
    }
    const like = new this.likeModel(data);
    return like.save();
  }

  async deleteLike(query: { user_id: string; post_id?: string; comment_id?: string }) {
    return this.likeModel.findOneAndDelete(query).exec();
  }

  async findLike(query: { user_id: string; post_id?: string; comment_id?: string }) {
    return this.likeModel.findOne(query).exec();
  }

  async findLikes(query: { post_id?: string; comment_id?: string }) {
    return this.likeModel.find(query).exec();
  }

  async deleteLikesByPostId(post_id: string) {
    return this.likeModel.deleteMany({ post_id }).exec();
  }

  async deleteLikesByCommentId(comment_id: string) {
    return this.likeModel.deleteMany({ comment_id }).exec();
  }
}
