import { Body, Controller, Delete, Get, NotFoundException, Param, Post, UsePipes, ValidationPipe, HttpCode } from '@nestjs/common';
import { PostService } from '../services/services';
import { CreatePostDto } from '../DTOs/DTOs';
import { isValidObjectId } from 'mongoose';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createPost(@Body() createPostDto: CreatePostDto) {
    console.log('Received body:', createPostDto);
    return this.postService.createPost(createPostDto);
  }

  @Get('user/:userId')
  async getPostsByUserId(@Param('userId') userId: string) {
    return this.postService.getPostsByUserId(userId);
  }

  @Post('users')
  @HttpCode(200)
  async getPostsByUserIds(@Body('user_ids') userIds: string[]) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new NotFoundException('user_ids array is required');
    }
    return this.postService.getPostsByUserIds(userIds);
  }

  @Delete(':postId')
  async deletePost(@Param('postId') postId: string) {
    try {
      const deleted = await this.postService.deletePost(postId);
      if (!deleted) {
        throw new NotFoundException('Post not found');
      }
      return deleted;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new NotFoundException('Post not found');
      }
      throw err;
    }
  }
} 