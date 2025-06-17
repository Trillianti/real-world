import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagsService {
    constructor(private readonly prisma: PrismaService) {}

    async getAllTags(): Promise<{ tags: string[] }> {
        const articles = await this.prisma.article.findMany({
            select: { tagList: true },
        });

        const tagSet = new Set<string>();

        for (const article of articles) {
            for (const tag of article.tagList) {
                tagSet.add(tag);
            }
        }

        return { tags: Array.from(tagSet).sort() };
    }
}
