import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('ArticlesController', () => {
    let controller: ArticlesController;
    let mockService: Partial<Record<keyof ArticlesService, jest.Mock>>;

    const user = { id: 1 };
    const slug = 'test-slug';

    beforeEach(() => {
        mockService = {
            findAll: jest.fn(),
            findFeedForUser: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            addFavorites: jest.fn(),
            removeFavorites: jest.fn(),
            getComments: jest.fn(),
            postComments: jest.fn(),
            updateComments: jest.fn(),
            deleteComments: jest.fn(),
        };

        controller = new ArticlesController(
            mockService as unknown as ArticlesService,
        );
    });

    it('should call findAll', async () => {
        await controller.findAll(user, 'tag', 'author', 'fav', '10', '5');
        expect(mockService.findAll).toHaveBeenCalledWith({
            tag: 'tag',
            author: 'author',
            favorited: 'fav',
            limit: 10,
            offset: 5,
            currentUserId: user.id,
        });
    });

    it('should call findFeed', async () => {
        await controller.findFeed(user);
        expect(mockService.findFeedForUser).toHaveBeenCalledWith(user.id);
    });

    it('should call create', async () => {
        const dto: CreateArticleDto = {
            title: 'title',
            description: 'desc',
            body: 'body',
            tagList: ['test'],
        };
        await controller.create(dto, user);
        expect(mockService.create).toHaveBeenCalledWith(dto, user.id);
    });

    it('should call findOne', async () => {
        await controller.findOne(slug);
        expect(mockService.findOne).toHaveBeenCalledWith(slug);
    });

    it('should call update', async () => {
        const dto: UpdateArticleDto = {
            title: 'title',
            description: 'desc',
            body: 'body',
        };
        await controller.update(slug, dto, user);
        expect(mockService.update).toHaveBeenCalledWith(slug, dto, user.id);
    });

    it('should call delete', async () => {
        await controller.delete(slug, user);
        expect(mockService.delete).toHaveBeenCalledWith(slug, user.id);
    });

    it('should call addFavorite', async () => {
        await controller.addFavorite(slug, user);
        expect(mockService.addFavorites).toHaveBeenCalledWith(slug, user.id);
    });

    it('should call removeFavorite', async () => {
        await controller.removeFavorite(slug, user);
        expect(mockService.removeFavorites).toHaveBeenCalledWith(slug, user.id);
    });

    it('should call getComments', async () => {
        await controller.getComments(slug);
        expect(mockService.getComments).toHaveBeenCalledWith(slug);
    });

    it('should call postComment', async () => {
        const dto: CreateCommentDto = { comment: 'Nice post!' };
        await controller.postComment(slug, dto, user);
        expect(mockService.postComments).toHaveBeenCalledWith(
            slug,
            dto,
            user.id,
        );
    });

    it('should call updateComment', async () => {
        const dto: UpdateCommentDto = { comment: 'Updated comment' };
        await controller.updateComment(slug, 1, dto, user);
        expect(mockService.updateComments).toHaveBeenCalledWith(
            slug,
            1,
            dto,
            user.id,
        );
    });

    it('should call deleteComment', async () => {
        await controller.deleteComment(slug, 1, user);
        expect(mockService.deleteComments).toHaveBeenCalledWith(
            slug,
            1,
            user.id,
        );
    });
});
