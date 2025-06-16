import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './post/models/models';
import { CommentSchema } from './comment/models/models';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { HealthController } from './health/health.controller';
import { mongodbConfig } from './config/database';

@Module({
  imports: [
    MongooseModule.forRoot(mongodbConfig.uri, {
      authSource: mongodbConfig.authSource,
      retryWrites: mongodbConfig.retryWrites,
      ssl: mongodbConfig.ssl,
      tls: mongodbConfig.tls,
      tlsAllowInvalidCertificates: mongodbConfig.tlsAllowInvalidCertificates,
      tlsAllowInvalidHostnames: mongodbConfig.tlsAllowInvalidHostnames
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