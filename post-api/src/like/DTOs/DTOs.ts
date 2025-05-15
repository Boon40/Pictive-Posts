import { IsString, IsOptional, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'ExactlyOneTarget', async: false })
export class ExactlyOneTarget implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    return (obj.post_id && !obj.comment_id) || (!obj.post_id && obj.comment_id);
  }
  defaultMessage(args: ValidationArguments) {
    return 'Exactly one of post_id or comment_id must be provided.';
  }
}

export class CreateLikeDto {
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  post_id?: string;

  @IsOptional()
  @IsString()
  comment_id?: string;

  @Validate(ExactlyOneTarget)
  _target?: any; // dummy property to trigger the custom validator
}

export class CreateCommentLikeDto {
  comment_id: string;
} 