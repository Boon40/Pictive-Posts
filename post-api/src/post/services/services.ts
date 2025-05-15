import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PostRepository } from '../repositories/repositories';
import { CommentRepository } from '../../comment/repositories/repositories';
import { LikeRepository } from '../../like/repositories/repositories';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(forwardRef(() => CommentRepository)) private readonly commentRepository: CommentRepository,
    @Inject(forwardRef(() => LikeRepository)) private readonly likeRepository: LikeRepository,
  ) {}

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
