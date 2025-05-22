import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../models/models';

@Injectable()
export class PostRepository {
  private readonly logger = new Logger(PostRepository.name);

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  async getPosts(page: number = 1, limit: number = 10) {
    this.logger.debug(`Repository: Getting posts with page=${page}, limit=${limit}`);
    try {
      const skip = (page - 1) * limit;
      this.logger.debug(`Repository: Skipping ${skip} posts`);
      
      const [posts, total] = await Promise.all([
        this.postModel
          .find()
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.postModel.countDocuments(),
      ]);

      this.logger.debug(`Repository: Found ${posts.length} posts out of ${total} total`);

      const hasNextPage = skip + posts.length < total;
      const nextPage = hasNextPage ? page + 1 : null;

      return {
        posts,
        next_page: nextPage,
      };
    } catch (error) {
      this.logger.error(`Repository: Error getting posts: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createPost(data: any) {
    if (!data._id) {
      data._id = Math.random().toString(36).substring(2, 15);
    }
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

  async findPostById(postId: string) {
    return this.postModel.findOne({ _id: postId }).exec();
  }
}
