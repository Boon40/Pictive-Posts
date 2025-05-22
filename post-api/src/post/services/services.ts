import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { PostRepository } from '../repositories/repositories';
import { CommentRepository } from '../../comment/repositories/repositories';
import { LikeRepository } from '../../like/repositories/repositories';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly postRepository: PostRepository,
    @Inject(forwardRef(() => CommentRepository)) private readonly commentRepository: CommentRepository,
    @Inject(forwardRef(() => LikeRepository)) private readonly likeRepository: LikeRepository,
  ) {}

  async getPosts(page: number = 1, limit: number = 10) {
    this.logger.debug(`Service: Getting posts with page=${page}, limit=${limit}`);
    try {
      const result = await this.postRepository.getPosts(page, limit);
      this.logger.debug(`Service: Found ${result.posts.length} posts`);
      return result;
    } catch (error) {
      this.logger.error(`Service: Error getting posts: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createPost(data: any) {
    return this.postRepository.createPost(data);
  }

  async getPostsByUserId(userId: string) {
    return this.postRepository.getPostsByUserId(userId);
  }

  async getPostsByUserIds(userIds: string[]) {
    return this.postRepository.getPostsByUserIds(userIds);
  }

  async deletePost(postId: string) {
    // Get all comment IDs first
    const allCommentIds = await this.commentRepository.getAllCommentIdsByPostId(postId);
    
    // Delete all likes for all comments and replies first
    for (const commentId of allCommentIds) {
      await this.likeRepository.deleteLikesByCommentId(commentId);
    }
    
    // Delete all likes for this post
    await this.likeRepository.deleteLikesByPostId(postId);
    
    // Delete all comments (and their replies) for this post
    await this.commentRepository.deleteCommentsByPostId(postId);
    
    // Finally delete the post
    const deleted = await this.postRepository.deletePost(postId);
    return deleted;
  }
}
