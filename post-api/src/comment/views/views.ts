import { Body, Controller, Delete, Get, NotFoundException, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommentService } from '../services/services';
import { CreateCommentDto } from '../DTOs/DTOs';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.createComment(createCommentDto);
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    const deleted = await this.commentService.deleteComment(id);
    if (!deleted) {
      throw new NotFoundException('Comment not found');
    }
    return deleted;
  }

  @Get('post/:postId')
  async getCommentsByPostId(@Param('postId') postId: string) {
    return this.commentService.getCommentsByPostId(postId);
  }
} 