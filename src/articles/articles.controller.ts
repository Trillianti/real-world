import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    UseGuards,
    Put,
    Delete,
    Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { userInterface } from 'src/common/interfaces/user.interface';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(
        @User() user: userInterface,
        @Query('tag') tag?: string,
        @Query('author') author?: string,
        @Query('favorited') favorited?: string,
        @Query('limit') limit = '20',
        @Query('offset') offset = '0',
    ) {
        return this.articlesService.findAll({
            tag,
            author,
            favorited,
            limit: +limit,
            offset: +offset,
            currentUserId: user.id,
        });
    }

    @Get('feed')
    @UseGuards(JwtAuthGuard)
    async findAllSubs(@User() user: userInterface) {
        return this.articlesService.findAllSubs(user.id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: any, @User() user: userInterface) {
        return this.articlesService.create(body, user.id);
    }

    @Get(':slug')
    async findOne(@Param('slug') slug: string) {
        return this.articlesService.findOne(slug);
    }

    @Put(':slug')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('slug') slug: string,
        @Body() body: any,
        @User() user: userInterface,
    ) {
        return this.articlesService.update(body, slug, user.id);
    }

    @Delete(':slug')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('slug') slug: string, @User() user: userInterface) {
        return this.articlesService.delete(slug, user.id);
    }
}
