import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { CommentRepository } from '../repositories/repositories';
import { PostRepository } from '../../post/repositories/repositories';
import { LikeRepository } from '../../like/repositories/repositories';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    @Inject(forwardRef(() => PostRepository)) private readonly postRepository: PostRepository,
    @Inject(forwardRef(() => LikeRepository)) private readonly likeRepository: LikeRepository,
  ) {}

  async createComment(data: any) {
    // If post_id is provided, check if post exists
    if (data.post_id) {
      const post = await this.postRepository.findPostById(data.post_id);
      if (!post) {
        throw new NotFoundException('Post not found');
      }
    }
    // If parent_comment_id is provided, check if parent exists and is not a reply
    if (data.parent_comment_id) {
      const parent = await this.commentRepository.findCommentById(data.parent_comment_id);
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
      if (parent.parent_comment_id) {
        throw new BadRequestException('Cannot reply to a reply');
      }
    }
    return this.commentRepository.createComment(data);
  }

  async deleteComment(commentId: string) {
    // Get all reply IDs first
    const replyIds = await this.commentRepository.getAllReplyIdsByParentCommentId(commentId);
    
    // Delete all likes for all replies first
    for (const replyId of replyIds) {
      await this.likeRepository.deleteLikesByCommentId(replyId);
    }
    
    // Delete all replies
    await this.commentRepository.deleteRepliesByParentCommentId(commentId);
    
    // Delete all likes for this comment
    await this.likeRepository.deleteLikesByCommentId(commentId);
    
    // Finally delete the comment
    const deleted = await this.commentRepository.deleteComment(commentId);
    return deleted;
  }

  async getCommentsByPostId(postId: string) {
    const comments = await this.commentRepository.getCommentsByPostId(postId);
    // Separate top-level comments and replies
    const topLevel = comments.filter((c: any) => c.post_id === postId);
    const replies = comments.filter((c: any) => c.parent_comment_id);
    // Attach replies to their parent comment
    const result = topLevel.map((comment: any) => ({
      ...comment.toObject(),
      replies: replies.filter((r: any) => r.parent_comment_id === String(comment._id)),
    }));
    return result;
  }
}
