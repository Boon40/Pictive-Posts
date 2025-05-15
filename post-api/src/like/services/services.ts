import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { LikeRepository } from '../repositories/repositories';
import { PostRepository } from '../../post/repositories/repositories';
import { CommentRepository } from '../../comment/repositories/repositories';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepository: LikeRepository,
    @Inject(forwardRef(() => PostRepository)) private readonly postRepository: PostRepository,
    @Inject(forwardRef(() => CommentRepository)) private readonly commentRepository: CommentRepository,
  ) {}

  async like(data: any) {
    // Prevent duplicate likes
    const existing = await this.likeRepository.findLike({
      user_id: data.user_id,
      post_id: data.post_id,
      comment_id: data.comment_id,
    });
    if (existing) {
      throw new BadRequestException('User has already liked this post/comment');
    }
    // Check if post or comment exists
    if (data.post_id) {
      const post = await this.postRepository.findPostById(data.post_id);
      if (!post) {
        throw new NotFoundException('Cannot like: Post does not exist');
      }
    }
    if (data.comment_id) {
      const comment = await this.commentRepository.findCommentById(data.comment_id);
      if (!comment) {
        throw new NotFoundException('Cannot like: Comment does not exist');
      }
    }
    return this.likeRepository.createLike(data);
  }

  async dislike(query: { user_id: string; post_id?: string; comment_id?: string }) {
    const deleted = await this.likeRepository.deleteLike(query);
    if (!deleted) {
      throw new NotFoundException('Like not found for this user and post/comment');
    }
    return deleted;
  }

  async getLikesByPostId(post_id: string) {
    return this.likeRepository.findLikes({ post_id });
  }

  async getLikesByCommentId(comment_id: string) {
    return this.likeRepository.findLikes({ comment_id });
  }
}
