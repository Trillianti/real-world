import { TagsService } from './tags.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TagsService', () => {
    let service: TagsService;
    let mockPrisma: Partial<PrismaService>;

    beforeEach(() => {
        mockPrisma = {
            article: {
                findMany: jest
                    .fn()
                    .mockResolvedValue([
                        { tagList: ['nestjs', 'typescript'] },
                        { tagList: ['typescript', 'testing'] },
                    ]),
            } as any, // 👈 тип Prisma.ArticleDelegate не нужен, мы подменяем только то, что используем
        };

        service = new TagsService(mockPrisma as PrismaService);
    });

    it('should return unique sorted tags from all articles', async () => {
        const result = await service.getAllTags();

        expect(result).toEqual({
            tags: ['nestjs', 'testing', 'typescript'],
        });

        expect(mockPrisma.article?.findMany).toHaveBeenCalled();
    });
});
