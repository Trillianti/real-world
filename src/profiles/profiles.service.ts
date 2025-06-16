import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { DEFAULT_FACTORY_CLASS_METHOD_KEY } from '@nestjs/common/module-utils/constants';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfilesService {
    constructor(private prisma: PrismaService) {}

    async findUser(
        username: string,
        userId?: number,
    ): Promise<{
        profile: {
            username: string;
            bio: string | null;
            image: string | null;
            following: boolean;
        };
    }> {
        let following = false;
        const user = await this.prisma.user.findFirst({
            where: {
                username,
            },
        });
        if (!user) throw new NotFoundException();
        if (userId) {
            const isFollowed = await this.prisma.follow.findFirst({
                where: {
                    followerId: userId,
                    followingId: user.id,
                },
            });
            if (isFollowed) following = true;
        }

        return {
            profile: {
                username: user.username,
                bio: user.bio,
                image: user.image,
                following,
            },
        };
    }

    async followUser(
        username: string,
        userId: number,
    ): Promise<{
        profile: {
            username: string;
            bio: string | null;
            image: string | null;
            following: boolean;
        };
    }> {
        const userToFollow = await this.prisma.user.findFirst({
            where: { username },
        });

        if (!userToFollow) throw new NotFoundException();
        else if (userToFollow.id === userId)
            throw new BadRequestException('You cannot follow yourself');

        const isFollowed = await this.prisma.follow.findFirst({
            where: {
                followerId: userId,
                followingId: userToFollow.id,
            },
        });

        if (isFollowed)
            throw new BadRequestException('Already following this user');

        await this.prisma.follow.create({
            data: {
                followerId: userId,
                followingId: userToFollow.id,
            },
        });
        return {
            profile: {
                username: userToFollow.username,
                bio: userToFollow.bio,
                image: userToFollow.image,
                following: true,
            },
        };
    }

    async unfollowUser(
        username: string,
        userId: number,
    ): Promise<{
        profile: {
            username: string;
            bio: string | null;
            image: string | null;
            following: boolean;
        };
    }> {
        const userToUnfollow = await this.prisma.user.findFirst({
            where: { username },
        });

        if (!userToUnfollow) throw new NotFoundException();
        else if (userToUnfollow.id === userId)
            throw new BadRequestException('You cannot unfollow yourself');

        const isFollowed = await this.prisma.follow.findFirst({
            where: {
                followerId: userId,
                followingId: userToUnfollow.id,
            },
        });

        if (!isFollowed)
            throw new BadRequestException("You're not following this user");

        await this.prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: userToUnfollow.id,
                },
            },
        });
        return {
            profile: {
                username: userToUnfollow.username,
                bio: userToUnfollow.bio,
                image: userToUnfollow.image,
                following: false,
            },
        };
    }
}
