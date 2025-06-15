import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Article } from '@prisma/client';
import slugify from 'slugify';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

// TODO: Make filter for Favorites
@Injectable()
export class ArticlesService {
    constructor(private prisma: PrismaService) {}
    async findAll(
        body,
    ): Promise<{ articles: Article[]; articlesCount: number }> {
        const where: any = {};
        if (body.tag) where.tagList = { has: body.tag };
        if (body.author) where.author = { username: body.author };
        // if (favorited) where.favorited = { getUserIdByUsername(favorited) };

        const [articles, count] = await this.prisma.$transaction([
            this.prisma.article.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: body.limit,
                skip: body.offset,
                include: { author: true, favorites: true },
            }),
            this.prisma.article.count({ where }),
        ]);
        return { articles, articlesCount: count };
    }

    async findOne(slug: string): Promise<{ article: Article | null }> {
        const article = await this.prisma.article.findFirst({
            where: { slug },
        });
        return { article };
    }

    async create(
        data: CreateArticleDto,
        authorId: number,
    ): Promise<{ article: Article }> {
        let count = 0;
        const baseSlug = slugify(data.title, { lower: true, strict: true });
        let slug = baseSlug;

        while (await this.prisma.article.findUnique({ where: { slug } })) {
            count++;
            slug = `${baseSlug}-${count}`;
        }

        const article = await this.prisma.article.create({
            data: {
                slug: slug,
                title: data.title,
                description: data.description,
                body: data.body,
                tagList: data.tagList ?? [],
                author: { connect: { id: authorId } },
            },
        });
        return { article };
    }

    async update(
        data: UpdateArticleDto,
        slug: string,
        userId: number,
    ): Promise<{ article: Article }> {
        const article = await this.prisma.article.findFirst({
            where: { slug },
        });
        if (!article) throw new NotFoundException();
        if (article.authorId != userId) throw new ForbiddenException();
        const updatedArticle = await this.prisma.article.update({
            where: {
                slug: slug,
            },
            data,
        });
        return { article: updatedArticle };
    }

    async delete(slug: string, userId: number): Promise<{ article: Article }> {
        const article = await this.prisma.article.findFirst({
            where: { slug },
        });
        if (!article) throw new NotFoundException();
        if (article.authorId != userId) throw new ForbiddenException();

        const deletedArticle = await this.prisma.article.delete({
            where: { slug, authorId: userId },
        });
        return { article: deletedArticle };
    }
}
