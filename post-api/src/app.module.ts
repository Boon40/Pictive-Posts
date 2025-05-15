import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './post/models/models';
import { CommentSchema } from './comment/models/models';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/pictive-posts'),
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'Comment', schema: CommentSchema },
    ]),
    PostModule,
    CommentModule,
    LikeModule,
  ],
})
export class AppModule {} 