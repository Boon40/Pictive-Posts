import { IsString, IsOptional, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'EitherPostOrParent', async: false })
export class EitherPostOrParent implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    return !!(obj.post_id || obj.parent_comment_id);
  }
  defaultMessage(args: ValidationArguments) {
    return 'Either post_id or parent_comment_id must be provided.';
  }
}

export class CreateCommentDto {
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  post_id?: string;

  @IsOptional()
  @IsString()
  parent_comment_id?: string;

  @IsString()
  content: string;

  @Validate(EitherPostOrParent)
  _either?: any; // dummy property to trigger the custom validator
} 