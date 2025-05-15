import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from '../../post/post.module';
import { CommentModule } from '../comment.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

describe('Comment Features (e2e)', () => {
  let app: INestApplication;
  let mongoUri: string;
  let createdPostId: string;
  let createdCommentId: string;
  let createdReplyId: string;
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

  it('should create a post for comment context', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({
        user_id: userId1,
        text: 'Test post for comments',
        image_url: 'https://example.com/image1.jpg',
      })
      .expect(201);
    createdPostId = res.body._id;
  });

  it('should create a comment on a post', async () => {
    const res = await request(app.getHttpServer())
      .post('/comments')
      .send({
        user_id: userId1,
        post_id: createdPostId,
        content: 'Top-level comment',
      })
      .expect(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.content).toBe('Top-level comment');
    createdCommentId = res.body._id;
  });

  it('should not create a comment on a non-existent post', async () => {
    await request(app.getHttpServer())
      .post('/comments')
      .send({
        user_id: userId1,
        post_id: 'nonexistent-post',
        content: 'Should fail',
      })
      .expect(404);
  });

  it('should create a reply to a comment', async () => {
    const res = await request(app.getHttpServer())
      .post('/comments')
      .send({
        user_id: userId2,
        parent_comment_id: createdCommentId,
        content: 'Reply to comment',
      })
      .expect(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.content).toBe('Reply to comment');
    createdReplyId = res.body._id;
  });

  it('should not create a reply to a non-existent comment', async () => {
    await request(app.getHttpServer())
      .post('/comments')
      .send({
        user_id: userId2,
        parent_comment_id: 'nonexistent-comment',
        content: 'Should fail',
      })
      .expect(404);
  });

  it('should not create a reply to a reply', async () => {
    await request(app.getHttpServer())
      .post('/comments')
      .send({
        user_id: userId1,
        parent_comment_id: createdReplyId,
        content: 'Should fail',
      })
      .expect(400);
  });

  it('should not create a comment with both post_id and parent_comment_id missing', async () => {
    await request(app.getHttpServer())
      .post('/comments')
      .send({
        user_id: userId1,
        content: 'Should fail',
      })
      .expect(400);
  });

  it('should get all comments (with replies) for a post', async () => {
    const res = await request(app.getHttpServer())
      .get(`/comments/post/${createdPostId}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].content).toBe('Top-level comment');
    expect(Array.isArray(res.body[0].replies)).toBe(true);
    expect(res.body[0].replies.length).toBe(1);
    expect(res.body[0].replies[0].content).toBe('Reply to comment');
  });

  it('should delete a reply and not affect the parent comment', async () => {
    await request(app.getHttpServer())
      .delete(`/comments/${createdReplyId}`)
      .expect(200);
    // Parent comment should still exist
    const res = await request(app.getHttpServer())
      .get(`/comments/post/${createdPostId}`)
      .expect(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].content).toBe('Top-level comment');
    expect(res.body[0].replies.length).toBe(0);
  });

  it('should delete a comment and cascade delete its replies and all likes for them', async () => {
    // Create post
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .send({
        user_id: userId1,
        text: 'Cascade post for comment',
        image_url: 'https://example.com/image1.jpg',
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
    // Delete the comment
    await request(app.getHttpServer())
      .delete(`/comments/${commentId}`)
      .expect(200);
    // Both comment and reply should be gone
    const commentsRes = await request(app.getHttpServer())
      .get(`/comments/post/${postId}`)
      .expect(200);
    expect(commentsRes.body.length).toBe(0);
    // All likes for comment and reply should be gone
    const commentLikes = await request(app.getHttpServer())
      .get(`/likes/comment/${commentId}`)
      .expect(200);
    expect(commentLikes.body.length).toBe(0);
    const replyLikes = await request(app.getHttpServer())
      .get(`/likes/comment/${replyId}`)
      .expect(200);
    expect(replyLikes.body.length).toBe(0);
  });

  it('should return 404 when deleting a non-existent comment', async () => {
    await request(app.getHttpServer())
      .delete('/comments/doesnotexistid')
      .expect(404);
  });
});
