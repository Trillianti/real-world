import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfilesService {
    constructor(private readonly prisma: PrismaService) {}

    async findUser(
        username: string,
        currentUserId?: number,
    ): Promise<{ profile: ProfileResponse }> {
        const user = await this.getUserByUsername(username);
        const following = currentUserId
            ? await this.isFollowing(currentUserId, user.id)
            : false;

        return this.buildProfileResponse(user, following);
    }

    async followUser(
        username: string,
        currentUserId: number,
    ): Promise<{ profile: ProfileResponse }> {
        const userToFollow = await this.getUserByUsername(username);

        if (userToFollow.id === currentUserId) {
            throw new BadRequestException('You cannot follow yourself');
        }

        const alreadyFollowing = await this.isFollowing(
            currentUserId,
            userToFollow.id,
        );

        if (alreadyFollowing) {
            throw new BadRequestException('Already following this user');
        }

        await this.prisma.follow.create({
            data: {
                followerId: currentUserId,
                followingId: userToFollow.id,
            },
        });

        return this.buildProfileResponse(userToFollow, true);
    }

    async unfollowUser(
        username: string,
        currentUserId: number,
    ): Promise<{ profile: ProfileResponse }> {
        const userToUnfollow = await this.getUserByUsername(username);

        if (userToUnfollow.id === currentUserId) {
            throw new BadRequestException('You cannot unfollow yourself');
        }

        const following = await this.isFollowing(
            currentUserId,
            userToUnfollow.id,
        );

        if (!following) {
            throw new BadRequestException("You're not following this user");
        }

        await this.prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: userToUnfollow.id,
                },
            },
        });

        return this.buildProfileResponse(userToUnfollow, false);
    }

    // ====================

    private async getUserByUsername(username: string) {
        const user = await this.prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            throw new NotFoundException(`User '${username}' not found`);
        }

        return user;
    }

    private async isFollowing(
        followerId: number,
        followingId: number,
    ): Promise<boolean> {
        const follow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        return !!follow;
    }

    private buildProfileResponse(
        user: { username: string; bio: string | null; image: string | null },
        following: boolean,
    ): { profile: ProfileResponse } {
        return {
            profile: {
                username: user.username,
                bio: user.bio,
                image: user.image,
                following,
            },
        };
    }
}

// ===== Types =====

type ProfileResponse = {
    username: string;
    bio: string | null;
    image: string | null;
    following: boolean;
};
