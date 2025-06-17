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
import { CreateUserBodyDto } from './dto/create-user.dto';
import { LoginUserBodyDto } from './dto/login-user.dto';
import { UpdateUserBodyDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly authService: AuthService,
    ) {}

    async create(
        body: CreateUserBodyDto,
    ): Promise<{ user: User; access_token: string }> {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ username: body.username }, { email: body.email }],
            },
        });

        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const user = await this.prisma.user.create({
            data: {
                username: body.username,
                email: body.email,
                password: hashedPassword,
            },
        });

        const access_token = this.authService.login(user.id);
        return { user, access_token };
    }

    async login(
        body: LoginUserBodyDto,
    ): Promise<{ user: User; access_token: string }> {
        const user = await this.prisma.user.findUnique({
            where: { email: body.email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            body.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnprocessableEntityException('Invalid credentials');
        }

        const access_token = this.authService.login(user.id);
        return { user, access_token };
    }

    async getUser(
        userId: number,
    ): Promise<{ user: User; access_token: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const access_token = this.authService.login(user.id);
        return { user, access_token };
    }

    async update(
        body: UpdateUserBodyDto,
        userId: number,
    ): Promise<{ user: User; access_token: string }> {
        if (body.password) {
            body.password = await bcrypt.hash(body.password, 10);
        }

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: body,
        });

        const access_token = this.authService.login(user.id);
        return { user, access_token };
    }
}
