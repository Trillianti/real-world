import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Article, Comment, User } from '@prisma/client';
import slugify from 'slugify';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
    constructor(private readonly prisma: PrismaService) {}

    private readonly articleInclude = {
        author: {
            select: {
                id: true,
                username: true,
                bio: true,
                image: true,
            },
        },
        favorites: true,
    };

    private readonly commentInclude = {
        author: {
            select: {
                id: true,
                username: true,
                bio: true,
                image: true,
            },
        },
    };

    // -- Article helpers --

    private async getArticle(slug: string): Promise<Article>;
    private async getArticle<T extends Prisma.ArticleInclude>(
        slug: string,
        include: T,
    ): Promise<Prisma.ArticleGetPayload<{ include: T }>>;
    private async getArticle<T extends Prisma.ArticleInclude>(
        slug: string,
        include?: T,
    ): Promise<Article | Prisma.ArticleGetPayload<{ include: T }>> {
        const article = await this.prisma.article.findUnique({
            where: { slug },
            include,
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        return article;
    }

    private async assertOwnership(
        authorId: number,
        userId: number,
    ): Promise<void> {
        if (authorId !== userId) {
            throw new ForbiddenException('You do not own this resource');
        }
    }

    // -- Articles --

    async findAll(query: {
        tag?: string;
        author?: string;
        favorited?: string;
        limit?: number;
        offset?: number;
        currentUserId?: number;
    }): Promise<{ articles: any[]; articlesCount: number }> {
        const where: Prisma.ArticleWhereInput = {};

        if (query.tag) {
            where.tagList = { has: query.tag };
        }

        if (query.author) {
            where.author = { username: query.author };
        }

        if (query.favorited) {
            const user = await this.prisma.user.findUnique({
                where: { username: query.favorited },
                include: {
                    favorites: {
                        select: { articleId: true },
                    },
                },
            });

            if (user) {
                const favoritedArticleIds = user.favorites.map(
                    (fav) => fav.articleId,
                );
                where.id = { in: favoritedArticleIds };
            } else {
                where.id = { in: [] };
            }
        }

        const [articles, articlesCount] = await this.prisma.$transaction([
            this.prisma.article.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: query.limit,
                skip: query.offset,
                include: this.articleInclude,
            }),
            this.prisma.article.count({ where }),
        ]);

        return { articles, articlesCount };
    }

    async findOne(slug: string) {
        const article = await this.getArticle(slug, this.articleInclude);
        return { article };
    }

    async create(
        dto: CreateArticleDto,
        authorId: number,
    ): Promise<{ article: any }> {
        const baseSlug = slugify(dto.title, { lower: true, strict: true });
        let slug = baseSlug;
        let count = 0;

        while (await this.prisma.article.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${++count}`;
        }

        const article = await this.prisma.article.create({
            data: {
                slug,
                title: dto.title,
                description: dto.description,
                body: dto.body,
                tagList: dto.tagList ?? [],
                author: { connect: { id: authorId } },
            },
            include: this.articleInclude,
        });

        return { article };
    }

    async update(
        slug: string,
        dto: UpdateArticleDto,
        userId: number,
    ): Promise<{ article: any }> {
        const article = await this.getArticle(slug);

        await this.assertOwnership(article.authorId, userId);

        const updated = await this.prisma.article.update({
            where: { slug },
            data: dto,
            include: this.articleInclude,
        });

        return { article: updated };
    }

    async delete(slug: string, userId: number): Promise<{ article: Article }> {
        const article = await this.getArticle(slug);
        await this.assertOwnership(article.authorId, userId);

        const deleted = await this.prisma.article.delete({
            where: { slug },
        });

        return { article: deleted };
    }

    async findFeedForUser(userId: number): Promise<{ articles: any[] }> {
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });

        const articles = await this.prisma.article.findMany({
            where: {
                authorId: { in: following.map((f) => f.followingId) },
            },
            include: this.articleInclude,
        });

        return { articles };
    }

    async addFavorites(
        slug: string,
        userId: number,
    ): Promise<{ article: any }> {
        const article = await this.getArticle(slug);

        const existing = await this.prisma.favorite.findUnique({
            where: {
                userId_articleId: {
                    userId,
                    articleId: article.id,
                },
            },
        });

        if (existing) {
            throw new BadRequestException('Article already favorited');
        }

        await this.prisma.favorite.create({
            data: {
                userId,
                articleId: article.id,
            },
        });

        const updated = await this.getArticle(slug, this.articleInclude);
        return { article: updated };
    }

    async removeFavorites(
        slug: string,
        userId: number,
    ): Promise<{ article: any }> {
        const article = await this.getArticle(slug);

        const favorite = await this.prisma.favorite.findUnique({
            where: {
                userId_articleId: {
                    userId,
                    articleId: article.id,
                },
            },
        });

        if (!favorite) {
            throw new BadRequestException('Article is not favorited');
        }

        await this.prisma.favorite.delete({
            where: {
                userId_articleId: {
                    userId,
                    articleId: article.id,
                },
            },
        });

        const updated = await this.getArticle(slug, this.articleInclude);
        return { article: updated };
    }

    // -- Comments --

    async getComments(slug: string) {
        const article = await this.getArticle(slug, {
            comments: {
                include: this.commentInclude,
            },
        });

        return { comments: article.comments };
    }

    async postComments(
        slug: string,
        body: { comment: string },
        userId: number,
    ) {
        const article = await this.getArticle(slug);

        const comment = await this.prisma.comment.create({
            data: {
                body: body.comment,
                articleId: article.id,
                authorId: userId,
            },
            include: this.commentInclude,
        });

        return { comment };
    }

    async updateComments(
        slug: string,
        commentId: number,
        body: { comment: string },
        userId: number,
    ) {
        const article = await this.getArticle(slug);

        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment || comment.articleId !== article.id) {
            throw new NotFoundException('Comment not found');
        }

        await this.assertOwnership(comment.authorId, userId);

        const updated = await this.prisma.comment.update({
            where: { id: commentId },
            data: { body: body.comment },
            include: this.commentInclude,
        });

        return { comment: updated };
    }

    async deleteComments(slug: string, commentId: number, userId: number) {
        const article = await this.getArticle(slug);

        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment || comment.articleId !== article.id) {
            throw new NotFoundException('Comment not found');
        }

        await this.assertOwnership(comment.authorId, userId);

        await this.prisma.comment.delete({
            where: { id: commentId },
        });

        return { message: 'Comment deleted' };
    }
}
