import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

describe('ProfilesController', () => {
    let controller: ProfilesController;

    // ✅ Явное определение всех нужных методов
    const mockService = {
        findUser: jest.fn(),
        followUser: jest.fn(),
        unfollowUser: jest.fn(),
    };

    const mockProfileResponse = {
        profile: {
            username: 'user1',
            bio: null,
            image: null,
            following: true,
        },
    };

    beforeEach(() => {
        controller = new ProfilesController(
            mockService as unknown as ProfilesService,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get profile (unauthenticated)', async () => {
        mockService.findUser.mockResolvedValue(mockProfileResponse);

        const result = await controller.getProfile('user1', null);

        expect(mockService.findUser).toHaveBeenCalledWith('user1', undefined);
        expect(result).toEqual(mockProfileResponse);
    });

    it('should get profile (authenticated)', async () => {
        mockService.findUser.mockResolvedValue(mockProfileResponse);

        const result = await controller.getProfile('user1', { id: 2 });

        expect(mockService.findUser).toHaveBeenCalledWith('user1', 2);
        expect(result).toEqual(mockProfileResponse);
    });

    it('should follow user', async () => {
        mockService.followUser.mockResolvedValue(mockProfileResponse);

        const result = await controller.followUser('user1', { id: 2 });

        expect(mockService.followUser).toHaveBeenCalledWith('user1', 2);
        expect(result).toEqual(mockProfileResponse);
    });

    it('should unfollow user', async () => {
        mockService.unfollowUser.mockResolvedValue(mockProfileResponse);

        const result = await controller.unfollowUser('user1', { id: 2 });

        expect(mockService.unfollowUser).toHaveBeenCalledWith('user1', 2);
        expect(result).toEqual(mockProfileResponse);
    });
});
