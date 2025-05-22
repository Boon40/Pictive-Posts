import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './post/models/models';
import { CommentSchema } from './comment/models/models';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://post-db:27017/pictive-posts', {
      connectionFactory: (connection) => {
        console.log('Attempting to connect to MongoDB at: mongodb://post-db:27017/pictive-posts');
        connection.on('connected', () => {
          console.log('MongoDB connected successfully');
        });
        connection.on('error', (error) => {
          console.error('MongoDB connection error:', error);
        });
        connection.on('disconnected', () => {
          console.log('MongoDB disconnected');
        });
        return connection;
      },
    }),
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'Comment', schema: CommentSchema },
    ]),
    PostModule,
    CommentModule,
    LikeModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {} 