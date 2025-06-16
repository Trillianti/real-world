import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info, context) {
        // Не выбрасываем ошибку, просто возвращаем null если нет user
        return user || null;
    }
}
