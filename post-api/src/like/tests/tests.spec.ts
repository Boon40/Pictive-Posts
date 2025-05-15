import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from '../../post/post.module';
import { CommentModule } from '../../comment/comment.module';
import { LikeModule } from '../like.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

describe('Like Features (e2e)', () => {
  let app: INestApplication;
  let mongoUri: string;
  let postId: string;
  let commentId: string;
  const userId1 = 'test-user-1';
  const userId2 = 'test-user-2';

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        PostModule,
        CommentModule,
        LikeModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('should create a post and a comment for like context', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .send({
        user_id: userId1,
        text: 'Like test post',
        image_url: 'https://example.com/image.jpg',
      })
      .expect(201);
    postId = postRes.body._id;
    const commentRes = await request(app.getHttpServer())
      .post('/comments')
      .send({
        user_id: userId2,
        post_id: postId,
        content: 'Like test comment',
      })
      .expect(201);
    commentId = commentRes.body._id;
  });

  it('should like a post', async () => {
    const res = await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId1, post_id: postId })
      .expect(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.user_id).toBe(userId1);
    expect(res.body.post_id).toBe(postId);
  });

  it('should like a comment', async () => {
    const res = await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId2, comment_id: commentId })
      .expect(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.user_id).toBe(userId2);
    expect(res.body.comment_id).toBe(commentId);
  });

  it('should not allow duplicate like on post', async () => {
    await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId1, post_id: postId })
      .expect(400);
  });

  it('should not allow duplicate like on comment', async () => {
    await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId2, comment_id: commentId })
      .expect(400);
  });

  it('should not like a non-existent post', async () => {
    await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId1, post_id: 'nonexistent-post' })
      .expect(404);
  });

  it('should not like a non-existent comment', async () => {
    await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId1, comment_id: 'nonexistent-comment' })
      .expect(404);
  });

  it('should not like with both post_id and comment_id missing', async () => {
    await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId1 })
      .expect(400);
  });

  it('should not like with both post_id and comment_id present', async () => {
    await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId1, post_id: postId, comment_id: commentId })
      .expect(400);
  });

  it('should get all likes by post_id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/likes/post/${postId}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].post_id).toBe(postId);
  });

  it('should get all likes by comment_id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/likes/comment/${commentId}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].comment_id).toBe(commentId);
  });

  it('should dislike (delete like) for a post', async () => {
    await request(app.getHttpServer())
      .delete('/likes')
      .send({ user_id: userId1, post_id: postId })
      .expect(200);
    // Should be gone
    const res = await request(app.getHttpServer())
      .get(`/likes/post/${postId}`)
      .expect(200);
    expect(res.body.length).toBe(0);
  });

  it('should dislike (delete like) for a comment', async () => {
    await request(app.getHttpServer())
      .delete('/likes')
      .send({ user_id: userId2, comment_id: commentId })
      .expect(200);
    // Should be gone
    const res = await request(app.getHttpServer())
      .get(`/likes/comment/${commentId}`)
      .expect(200);
    expect(res.body.length).toBe(0);
  });

  it('should return 404 when disliking a non-existent like', async () => {
    await request(app.getHttpServer())
      .delete('/likes')
      .send({ user_id: userId1, post_id: postId })
      .expect(404);
  });
});
