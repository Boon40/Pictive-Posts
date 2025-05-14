export class CreatePostDto {
  text: string;
  image_url?: string;
}

export class UpdatePostDto {
  text?: string;
  image_url?: string;
} 