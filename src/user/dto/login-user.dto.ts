import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserBodyDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
