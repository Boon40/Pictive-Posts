export class CreateCommentDto {
  post_id: string;
  content: string;
}

export class UpdateCommentDto {
  content?: string;
} 