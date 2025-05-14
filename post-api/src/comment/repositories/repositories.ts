import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentSchema } from '../models/models';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<any>
  ) {}

  async createComment(data: any) {
    if (!data._id) {
      data._id = Math.random().toString(36).substring(2, 15);
    }
    const comment = new this.commentModel(data);
    return comment.save();
  }

  async deleteComment(commentId: string) {
    return this.commentModel.findOneAndDelete({ _id: commentId }).exec();
  }

  async getCommentsByPostId(postId: string) {
    // Get all comments for the post, including replies
    return this.commentModel.find({
      $or: [
        { post_id: postId },
        { parent_comment_id: { $exists: true, $ne: null } },
      ],
    }).sort({ created_at: 1 }).exec();
  }

  async findCommentById(commentId: string) {
    return this.commentModel.findOne({ _id: commentId }).exec();
  }

  async deleteCommentsByPostId(postId: string) {
    return this.commentModel.deleteMany({ post_id: postId }).exec();
  }

  async deleteRepliesByParentCommentId(parentCommentId: string) {
    return this.commentModel.deleteMany({ parent_comment_id: parentCommentId }).exec();
  }
}
