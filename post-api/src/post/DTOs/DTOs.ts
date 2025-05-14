import { IsString, IsOptional, MaxLength, IsMongoId } from 'class-validator';

export class CreatePostDto {
  @IsString()
  user_id: string;

  @IsString()
  @MaxLength(500)
  text: string;

  @IsOptional()
  @IsString()
  image_url?: string;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  text?: string;

  @IsOptional()
  @IsString()
  image_url?: string;
} 