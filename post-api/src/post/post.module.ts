import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from './controllers/controllers';
import { PostService } from './services/services';
import { PostRepository } from './repositories/repositories';
import { PostSchema } from './models/models';
import { CommentRepository } from '../comment/repositories/repositories';
import { CommentSchema } from '../comment/models/models';
import { LikeModule } from '../like/like.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'Comment', schema: CommentSchema },
    ]),
    forwardRef(() => require('../comment/comment.module').CommentModule),
    forwardRef(() => LikeModule),
  ],
  controllers: [PostController],
  providers: [PostService, PostRepository, CommentRepository],
  exports: [PostService, PostRepository],
})
export class PostModule {} 