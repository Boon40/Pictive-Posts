import { Body, Controller, Delete, Get, HttpCode, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { LikeService } from '../services/services';
import { CreateLikeDto } from '../DTOs/DTOs';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async like(@Body() createLikeDto: CreateLikeDto) {
    return this.likeService.like(createLikeDto);
  }

  @Delete()
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async dislike(@Body() body: CreateLikeDto) {
    // Accepts user_id and either post_id or comment_id
    return this.likeService.dislike({
      user_id: body.user_id,
      post_id: body.post_id,
      comment_id: body.comment_id,
    });
  }

  @Get('post/:postId')
  async getLikesByPostId(@Param('postId') postId: string) {
    return this.likeService.getLikesByPostId(postId);
  }

  @Get('comment/:commentId')
  async getLikesByCommentId(@Param('commentId') commentId: string) {
    return this.likeService.getLikesByCommentId(commentId);
  }
}
