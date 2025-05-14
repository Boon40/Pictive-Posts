import { Injectable } from '@nestjs/common';
import { PostRepository } from '../repositories/repositories';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(data: any) {
    return this.postRepository.createPost(data);
  }

  async getPostsByUserId(userId: string) {
    return this.postRepository.getPostsByUserId(userId);
  }

  async getPostsByUserIds(userIds: string[]) {
    return this.postRepository.getPostsByUserIds(userIds);
  }

  async deletePost(postId: string) {
    return this.postRepository.deletePost(postId);
  }
}
