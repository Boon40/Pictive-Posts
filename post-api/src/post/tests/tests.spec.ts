import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from '../post.module';
import { CommentModule } from '../../comment/comment.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

describe('Post Features (e2e)', () => {
  let app: INestApplication;
  let mongoUri: string;
  let createdPostId: string;
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

  it('should create a post', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({
        user_id: userId1,
        text: 'Test post 1',
        image_url: 'https://example.com/image1.jpg',
      })
      .expect(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.text).toBe('Test post 1');
    createdPostId = res.body._id;
  });

  it('should get posts by user ID (sorted)', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .send({
        user_id: userId1,
        text: 'Test post 2',
        image_url: 'https://example.com/image2.jpg',
      })
      .expect(201);
    const res = await request(app.getHttpServer())
      .get(`/posts/user/${userId1}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].text).toBe('Test post 2');
    expect(res.body[1].text).toBe('Test post 1');
  });

  it('should return empty array for user with no posts', async () => {
    const res = await request(app.getHttpServer())
      .get('/posts/user/nonexistent-user')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should get posts by multiple user IDs (sorted)', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts/users')
      .send({ user_ids: [userId1, userId2] })
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const texts = res.body.map((p: any) => p.text);
    expect(texts).toContain('Test post 1');
    expect(texts).toContain('Test post 2');
    for (let i = 1; i < res.body.length; i++) {
      expect(new Date(res.body[i - 1].created_at) >= new Date(res.body[i].created_at)).toBe(true);
    }
  });

  it('should return empty array for multiple user IDs with no posts', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts/users')
      .send({ user_ids: ['no-posts-1', 'no-posts-2'] })
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should return 404 for missing user_ids in /posts/users', async () => {
    await request(app.getHttpServer())
      .post('/posts/users')
      .send({})
      .expect(404);
  });

  it('should delete a post and cascade delete all its comments, replies, and all likes for them', async () => {
    // Create post
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .send({
        user_id: userId1,
        text: 'Cascade post',
        image_url: 'https://example.com/image.jpg',
      })
      .expect(201);
    const postId = postRes.body._id;
    // Create comment
    const commentRes = await request(app.getHttpServer())
      .post('/comments')
      .send({
        user_id: userId1,
        post_id: postId,
        content: 'Cascade comment',
      })
      .expect(201);
    const commentId = commentRes.body._id;
    // Create reply
    const replyRes = await request(app.getHttpServer())
      .post('/comments')
      .send({
        user_id: userId2,
        parent_comment_id: commentId,
        content: 'Cascade reply',
      })
      .expect(201);
    const replyId = replyRes.body._id;
    // Like the post
    await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId1, post_id: postId })
      .expect(201);
    // Like the comment
    await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId1, comment_id: commentId })
      .expect(201);
    // Like the reply
    await request(app.getHttpServer())
      .post('/likes')
      .send({ user_id: userId2, comment_id: replyId })
      .expect(201);
    // Delete the post
    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .expect(200);
    // All comments and replies should be gone
    const commentsRes = await request(app.getHttpServer())
      .get(`/comments/post/${postId}`)
      .expect(200);
    expect(commentsRes.body.length).toBe(0);
    // All likes for post, comment, and reply should be gone
    const postLikes = await request(app.getHttpServer())
      .get(`/likes/post/${postId}`)
      .expect(200);
    expect(postLikes.body.length).toBe(0);
    const commentLikes = await request(app.getHttpServer())
      .get(`/likes/comment/${commentId}`)
      .expect(200);
    expect(commentLikes.body.length).toBe(0);
    const replyLikes = await request(app.getHttpServer())
      .get(`/likes/comment/${replyId}`)
      .expect(200);
    expect(replyLikes.body.length).toBe(0);
  });

  it('should return 404 when deleting a non-existent post', async () => {
    await request(app.getHttpServer())
      .delete('/posts/doesnotexistid')
      .expect(404);
  });
});
