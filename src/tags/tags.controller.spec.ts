import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

describe('TagsController', () => {
    let controller: TagsController;
    let mockTagsService: Partial<TagsService>;

    beforeEach(() => {
        mockTagsService = {
            getAllTags: jest.fn().mockResolvedValue(['nestjs', 'typescript']),
        };

        controller = new TagsController(mockTagsService as TagsService);
    });

    it('should return all tags', async () => {
        const result = await controller.getAllTags();

        expect(result).toEqual(['nestjs', 'typescript']);

        expect(mockTagsService.getAllTags).toHaveBeenCalled();
    });
});
