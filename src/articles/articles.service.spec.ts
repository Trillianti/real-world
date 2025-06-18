import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';

describe('ArticlesService', () => {
    let service: ArticlesService;
    let prisma: jest.Mocked<PrismaService>;

    const mockArticle = {
        id: 1,
        slug: 'test-article',
        title: 'Test Article',
        description: 'Test Desc',
        body: 'Test Body',
        tagList: ['nestjs'],
        authorId: 1,
    };

    const mockUser = {
        id: 1,
        username: 'user1',
        bio: null,
        image: null,
        favorites: [],
    };

    const asMock = <T>(fn: T) => fn as unknown as jest.Mock;

    beforeEach(async () => {
        const prismaMock = {
            article: {
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                findMany: jest.fn(),
                count: jest.fn(),
            },
            user: {
                findUnique: jest.fn(),
            },
            favorite: {
                findUnique: jest.fn(),
                create: jest.fn(),
                delete: jest.fn(),
            },
            follow: {
                findMany: jest.fn(),
            },
            comment: {
                create: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            $transaction: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArticlesService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        service = module.get<ArticlesService>(ArticlesService);
        prisma = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOne', () => {
        it('should return an article', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue(
                mockArticle as any,
            );

            const result = await service.findOne('test-article');
            expect(result.article).toEqual(mockArticle);
        });

        it('should throw if article not found', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue(null);

            await expect(service.findOne('not-found')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('create', () => {
        it('should create a new article', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue(null);
            asMock(prisma.article.create).mockResolvedValue(mockArticle as any);

            const result = await service.create(
                {
                    title: 'Test Article',
                    description: 'Test Desc',
                    body: 'Test Body',
                    tagList: ['nestjs'],
                },
                1,
            );

            expect(result.article).toEqual(mockArticle);
        });
    });

    describe('update', () => {
        it('should update an article if owned', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue(
                mockArticle as any,
            );
            asMock(prisma.article.update).mockResolvedValue({
                ...mockArticle,
                title: 'Updated',
            } as any);

            const result = await service.update(
                'test-article',
                {
                    title: 'Updated',
                    description: 'Some Updated',
                    body: 'Some body Updated',
                },
                1,
            );
            expect(result.article.title).toBe('Updated');
        });

        it('should throw if not owner', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue({
                ...mockArticle,
                authorId: 2,
            } as any);

            await expect(
                service.update(
                    'test-article',
                    {
                        title: 'Hack',
                        description: 'Some Hack',
                        body: 'Some body Hack',
                    },
                    1,
                ),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('delete', () => {
        it('should delete article if owner', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue(
                mockArticle as any,
            );
            asMock(prisma.article.delete).mockResolvedValue(mockArticle as any);

            const result = await service.delete('test-article', 1);
            expect(result.article).toEqual(mockArticle);
        });

        it('should throw if not owner', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue({
                ...mockArticle,
                authorId: 2,
            } as any);

            await expect(service.delete('test-article', 1)).rejects.toThrow(
                ForbiddenException,
            );
        });
    });

    describe('addFavorites/removeFavorites', () => {
        it('should add article to favorites', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue(
                mockArticle as any,
            );
            asMock(prisma.favorite.findUnique).mockResolvedValue(null);
            asMock(prisma.favorite.create).mockResolvedValue({} as any);
            asMock(prisma.article.findUnique).mockResolvedValueOnce(
                mockArticle as any,
            );

            const result = await service.addFavorites('test-article', 1);
            expect(result.article).toEqual(mockArticle);
        });

        it('should throw if already favorited', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue(
                mockArticle as any,
            );
            asMock(prisma.favorite.findUnique).mockResolvedValue({} as any);

            await expect(
                service.addFavorites('test-article', 1),
            ).rejects.toThrow(BadRequestException);
        });

        it('should remove article from favorites', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue(
                mockArticle as any,
            );
            asMock(prisma.favorite.findUnique).mockResolvedValue({} as any);
            asMock(prisma.favorite.delete).mockResolvedValue({} as any);
            asMock(prisma.article.findUnique).mockResolvedValueOnce(
                mockArticle as any,
            );

            const result = await service.removeFavorites('test-article', 1);
            expect(result.article).toEqual(mockArticle);
        });

        it('should throw if not favorited', async () => {
            asMock(prisma.article.findUnique).mockResolvedValue(
                mockArticle as any,
            );
            asMock(prisma.favorite.findUnique).mockResolvedValue(null);

            await expect(
                service.removeFavorites('test-article', 1),
            ).rejects.toThrow(BadRequestException);
        });
    });
});
