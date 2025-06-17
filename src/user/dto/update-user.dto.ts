import {
    IsEmail,
    IsOptional,
    IsString,
    IsUrl,
    MinLength,
} from 'class-validator';

export class UpdateUserBodyDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    username?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsUrl({}, { message: 'image must be a valid URL' })
    image?: string;
}
