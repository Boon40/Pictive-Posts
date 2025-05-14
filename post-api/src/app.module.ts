import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './post/models/models';
import { CommentSchema } from './comment/models/models';
import { PostLikeSchema } from './post-like/models/models';
import { CommentLikeSchema } from './comment-like/models/models';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/pictive-posts'),
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'Comment', schema: CommentSchema },
      { name: 'PostLike', schema: PostLikeSchema },
      { name: 'CommentLike', schema: CommentLikeSchema },
    ]),
  ],
})
export class AppModule {} 