import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from '../post.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

describe('PostController (e2e)', () => {
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

  it('should create another post for a different user', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .send({
        user_id: userId2,
        text: 'Test post 2',
        image_url: 'https://example.com/image2.jpg',
      })
      .expect(201);
  });

  it('should get posts by user ID (sorted)', async () => {
    // Add a second post for userId1 to test sorting
    await request(app.getHttpServer())
      .post('/posts')
      .send({
        user_id: userId1,
        text: 'Test post 3',
        image_url: 'https://example.com/image3.jpg',
      })
      .expect(201);
    const res = await request(app.getHttpServer())
      .get(`/posts/user/${userId1}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].text).toBe('Test post 3'); // Most recent first
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
      .expect(201).catch(() => null) || await request(app.getHttpServer())
      .post('/posts/users')
      .send({ user_ids: [userId1, userId2] })
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Should include all posts for both users
    const texts = res.body.map((p: any) => p.text);
    expect(texts).toContain('Test post 1');
    expect(texts).toContain('Test post 2');
    expect(texts).toContain('Test post 3');
    // Should be sorted by created_at descending
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

  it('should delete a post', async () => {
    await request(app.getHttpServer())
      .delete(`/posts/${createdPostId}`)
      .expect(200);
    // Confirm deletion
    const res = await request(app.getHttpServer())
      .get(`/posts/user/${userId1}`)
      .expect(200);
    expect(res.body.find((p: any) => p._id === createdPostId)).toBeUndefined();
  });

  it('should return 404 when deleting a non-existent post', async () => {
    await request(app.getHttpServer())
      .delete('/posts/doesnotexistid')
      .expect(404);
  });
});
