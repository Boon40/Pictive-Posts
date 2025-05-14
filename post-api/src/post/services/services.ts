import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PostRepository } from '../repositories/repositories';
import { CommentRepository } from '../../comment/repositories/repositories';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(forwardRef(() => CommentRepository)) private readonly commentRepository: CommentRepository,
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
    // Delete the post
    const deleted = await this.postRepository.deletePost(postId);
    // Cascade delete: delete all comments (and their replies) for this post
    await this.commentRepository.deleteCommentsByPostId(postId);
    // Also delete all replies to those comments
    // (deleteRepliesByParentCommentId will be called by deleteComment if needed)
    return deleted;
  }
}
