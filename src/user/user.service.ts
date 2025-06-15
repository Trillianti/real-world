import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private auth: AuthService,
    ) {}

    async create(body): Promise<{ user: User; access_token }> {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ username: body.username }, { email: body.email }],
            },
        });
        if (existingUser) {
            throw new BadRequestException('User alredy exists');
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username: body.username,
                email: body.email,
                password: hashedPassword,
            },
        });
        const access_token = this.auth.login(user.id);
        return { user, access_token };
    }

    async login(body): Promise<{ user: User; access_token }> {
        const user = await this.prisma.user.findFirst({
            where: { email: body.email },
        });
        if (!user) throw new NotFoundException();
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const isMatch = await bcrypt.compare(hashedPassword, user.password);
        if (!isMatch) throw new UnprocessableEntityException();
        const access_token = this.auth.login(user.id);
        return { user, access_token };
    }

    async getUser(userId): Promise<{ user: User; access_token }> {
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
        });
        if (!user) throw new NotFoundException();
        const access_token = this.auth.login(user.id);
        return { user, access_token };
    }

    async update(body, userId): Promise<{ user: User; access_token }> {
        if (body.password) body.password = await bcrypt.hash(body.password, 10);
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: body,
        });
        const access_token = this.auth.login(user.id);
        return { user, access_token };
    }
}
