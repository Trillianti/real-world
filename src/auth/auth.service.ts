import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwt: JwtService) {}

    login(userId: number) {
        const payload = { sub: userId };
        // expiresIn: '1d' — токен истекает через 24 часа
        return this.jwt.sign(payload, { expiresIn: '1d' });
    }
}
