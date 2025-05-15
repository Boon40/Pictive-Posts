import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeController } from './controllers/controllers';
import { LikeService } from './services/services';
import { LikeRepository } from './repositories/repositories';
import { LikeSchema } from './models/models';
import { PostModule } from '../post/post.module';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Like', schema: LikeSchema }]),
    forwardRef(() => PostModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [LikeController],
  providers: [LikeService, LikeRepository],
  exports: [LikeService, LikeRepository],
})
export class LikeModule {} 