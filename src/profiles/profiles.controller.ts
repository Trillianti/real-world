import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { userInterface } from 'src/common/interfaces/user.interface';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt-auth.guard';

@Controller('profiles/:username')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) {}

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    async findUser(
        @Param('username') username: string,
        @User() user: userInterface,
    ) {
        return this.profilesService.findUser(username, user?.id);
    }

    @Post('follow')
    @UseGuards(JwtAuthGuard)
    async followUser(
        @Param('username') username: string,
        @User() user: userInterface,
    ) {
        return this.profilesService.followUser(username, user.id);
    }

    @Delete('follow')
    @UseGuards(JwtAuthGuard)
    async unfollowUser(
        @Param('username') username: string,
        @User() user: userInterface,
    ) {
        return this.profilesService.unfollowUser(username, user.id);
    }
}
