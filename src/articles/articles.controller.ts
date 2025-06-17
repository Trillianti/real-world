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
    Patch,
    ParseIntPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { userInterface } from 'src/common/interfaces/user.interface';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    // 📄 Get all articles
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
            limit: Number(limit),
            offset: Number(offset),
            currentUserId: user.id,
        });
    }

    // 📡 User Feed
    @Get('feed')
    @UseGuards(JwtAuthGuard)
    async findFeed(@User() user: userInterface) {
        return this.articlesService.findFeedForUser(user.id);
    }

    // 📝 Create Article
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() dto: CreateArticleDto, @User() user: userInterface) {
        return this.articlesService.create(dto, user.id);
    }

    // 📄 Get one article
    @Get(':slug')
    async findOne(@Param('slug') slug: string) {
        return this.articlesService.findOne(slug);
    }

    // ✏️ Update article
    @Put(':slug')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('slug') slug: string,
        @Body() dto: UpdateArticleDto,
        @User() user: userInterface,
    ) {
        return this.articlesService.update(slug, dto, user.id);
    }

    // ❌ Delete article
    @Delete(':slug')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('slug') slug: string, @User() user: userInterface) {
        return this.articlesService.delete(slug, user.id);
    }

    // ⭐ Add to favorites
    @Post(':slug/favorite')
    @UseGuards(JwtAuthGuard)
    async addFavorite(
        @Param('slug') slug: string,
        @User() user: userInterface,
    ) {
        return this.articlesService.addFavorites(slug, user.id);
    }

    // ❌ Remove from favorites
    @Delete(':slug/favorite')
    @UseGuards(JwtAuthGuard)
    async removeFavorite(
        @Param('slug') slug: string,
        @User() user: userInterface,
    ) {
        return this.articlesService.removeFavorites(slug, user.id);
    }

    // 💬 Get comments
    @Get(':slug/comments')
    async getComments(@Param('slug') slug: string) {
        return this.articlesService.getComments(slug);
    }

    // ➕ Post comment
    @Post(':slug/comments')
    @UseGuards(JwtAuthGuard)
    async postComment(
        @Param('slug') slug: string,
        @Body() dto: CreateCommentDto,
        @User() user: userInterface,
    ) {
        return this.articlesService.postComments(slug, dto, user.id);
    }

    // ✏️ Update comment
    @Patch(':slug/comments/:id')
    @UseGuards(JwtAuthGuard)
    async updateComment(
        @Param('slug') slug: string,
        @Param('id', ParseIntPipe) commentId: number,
        @Body() dto: UpdateCommentDto,
        @User() user: userInterface,
    ) {
        return this.articlesService.updateComments(
            slug,
            commentId,
            dto,
            user.id,
        );
    }

    // ❌ Delete comment
    @Delete(':slug/comments/:id')
    @UseGuards(JwtAuthGuard)
    async deleteComment(
        @Param('slug') slug: string,
        @Param('id', ParseIntPipe) commentId: number,
        @User() user: userInterface,
    ) {
        return this.articlesService.deleteComments(slug, commentId, user.id);
    }
}
