import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCommentDto {
    @IsString()
    @MinLength(1)
    @MaxLength(1000)
    comment: string;
}
