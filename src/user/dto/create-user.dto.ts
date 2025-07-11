import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserBodyDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    username: string;
}
