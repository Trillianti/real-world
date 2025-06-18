import { ProfilesService } from './profiles.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProfilesService', () => {
    let service: ProfilesService;
    let mockPrisma: any;

    const mockUser = {
        id: 1,
        username: 'user1',
        bio: 'bio text',
        image: 'img.png',
    };

    beforeEach(() => {
        mockPrisma = {
            user: {
                findUnique: jest.fn(),
            },
            follow: {
                findUnique: jest.fn(),
                create: jest.fn(),
                delete: jest.fn(),
            },
        };

        service = new ProfilesService(mockPrisma);
    });

    it('should return profile with following = false if not logged in', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);

        const result = await service.findUser('user1');
        expect(result).toEqual({
            profile: {
                username: 'user1',
                bio: 'bio text',
                image: 'img.png',
                following: false,
            },
        });
    });

    it('should return profile with following = true if logged in and following', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        mockPrisma.follow.findUnique.mockResolvedValue({});

        const result = await service.findUser('user1', 2);
        expect(result.profile.following).toBe(true);
    });

    it('should throw NotFoundException if user not found', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await expect(service.findUser('missing')).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should follow another user and return profile with following = true', async () => {
        mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
        mockPrisma.follow.findUnique.mockResolvedValue(null);

        const result = await service.followUser('user1', 2);

        expect(mockPrisma.follow.create).toHaveBeenCalledWith({
            data: { followerId: 2, followingId: 1 },
        });

        expect(result.profile.following).toBe(true);
    });

    it('should not allow to follow self', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);

        await expect(service.followUser('user1', 1)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('should not follow if already following', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        mockPrisma.follow.findUnique.mockResolvedValue({});

        await expect(service.followUser('user1', 2)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('should unfollow user and return profile with following = false', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        mockPrisma.follow.findUnique.mockResolvedValue({});

        const result = await service.unfollowUser('user1', 2);

        expect(mockPrisma.follow.delete).toHaveBeenCalledWith({
            where: {
                followerId_followingId: { followerId: 2, followingId: 1 },
            },
        });

        expect(result.profile.following).toBe(false);
    });

    it('should not allow to unfollow self', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);

        await expect(service.unfollowUser('user1', 1)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('should throw if trying to unfollow someone not followed', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        mockPrisma.follow.findUnique.mockResolvedValue(null);

        await expect(service.unfollowUser('user1', 2)).rejects.toThrow(
            BadRequestException,
        );
    });
});
