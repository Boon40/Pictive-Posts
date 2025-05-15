import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentController } from './controllers/controllers';
import { CommentService } from './services/services';
import { CommentRepository } from './repositories/repositories';
import { CommentSchema } from './models/models';
import { PostRepository } from '../post/repositories/repositories';
import { PostSchema } from '../post/models/models';
import { LikeModule } from '../like/like.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Comment', schema: CommentSchema },
      { name: 'Post', schema: PostSchema },
    ]),
    forwardRef(() => require('../post/post.module').PostModule),
    forwardRef(() => LikeModule),
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository, PostRepository],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {} 