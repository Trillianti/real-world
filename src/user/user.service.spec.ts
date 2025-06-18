import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import {
    BadRequestException,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

describe('UserService', () => {
    let service: UserService;
    let mockPrisma: any;
    let authService: any;

    const mockUser = {
        id: 1,
        username: 'user1',
        email: 'test@example.com',
        password: 'hashedpass',
    };

    beforeEach(() => {
        mockPrisma = {
            user: {
                findFirst: jest.fn(),
                create: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };

        authService = {
            login: jest.fn(),
        };

        service = new UserService(mockPrisma, authService);
    });

    it('should create a new user and return token', async () => {
        mockPrisma.user.findFirst.mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
        mockPrisma.user.create.mockResolvedValue(mockUser);
        authService.login.mockReturnValue('mocked-token');

        const result = await service.create({
            username: 'user1',
            email: 'test@example.com',
            password: 'pass123',
        });

        expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
        expect(mockPrisma.user.create).toHaveBeenCalled();
        expect(result).toEqual({
            user: mockUser,
            access_token: 'mocked-token',
        });
    });

    it('should throw BadRequestException if user already exists', async () => {
        mockPrisma.user.findFirst.mockResolvedValue(mockUser);

        await expect(
            service.create({
                username: 'user1',
                email: 'test@example.com',
                password: 'pass123',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should login and return token', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        authService.login.mockReturnValue('mocked-token');

        const result = await service.login({
            email: 'test@example.com',
            password: 'pass123',
        });

        expect(result).toEqual({
            user: mockUser,
            access_token: 'mocked-token',
        });
    });

    it('should throw NotFoundException if user not found', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await expect(
            service.login({
                email: 'missing@example.com',
                password: 'pass123',
            }),
        ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException for wrong password', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(
            service.login({ email: 'test@example.com', password: 'wrong' }),
        ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should return user and token if found', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        authService.login.mockReturnValue('mocked-token');

        const result = await service.getUser(1);
        expect(result).toEqual({
            user: mockUser,
            access_token: 'mocked-token',
        });
    });

    it('should throw NotFoundException if user not found', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await expect(service.getUser(999)).rejects.toThrow(NotFoundException);
    });

    it('should update user without password hashing', async () => {
        mockPrisma.user.update.mockResolvedValue(mockUser);
        authService.login.mockReturnValue('mocked-token');

        const result = await service.update({ username: 'newname' }, 1);
        expect(result).toEqual({
            user: mockUser,
            access_token: 'mocked-token',
        });
    });

    it('should hash password if provided and update', async () => {
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
        mockPrisma.user.update.mockResolvedValue(mockUser);
        authService.login.mockReturnValue('mocked-token');

        const result = await service.update({ password: 'newpass' }, 1);
        expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
        expect(result).toEqual({
            user: mockUser,
            access_token: 'mocked-token',
        });
    });
});
