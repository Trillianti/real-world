import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { LoginUserBodyDto } from './dto/login-user.dto';
import { UpdateUserBodyDto } from './dto/update-user.dto';

describe('UserController', () => {
    let controller: UserController;

    // ✅ Явно описываем все моки и методы, избегаем Partial/Record
    const mockUserService = {
        create: jest.fn(),
        login: jest.fn(),
        getUser: jest.fn(),
        update: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'user1',
        email: 'test@example.com',
    };

    beforeEach(() => {
        controller = new UserController(
            mockUserService as unknown as UserService,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call userService.create() with correct data', async () => {
        const dto: CreateUserBodyDto = {
            username: 'user1',
            email: 'test@example.com',
            password: '123456',
        };

        mockUserService.create.mockResolvedValue({
            user: mockUser,
            access_token: 'token',
        });

        const result = await controller.create(dto);
        expect(mockUserService.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ user: mockUser, access_token: 'token' });
    });

    it('should call userService.login() with correct data', async () => {
        const dto: LoginUserBodyDto = {
            email: 'test@example.com',
            password: '123456',
        };

        mockUserService.login.mockResolvedValue({
            user: mockUser,
            access_token: 'token',
        });

        const result = await controller.login(dto);
        expect(mockUserService.login).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ user: mockUser, access_token: 'token' });
    });

    it('should call userService.getUser() with user id', async () => {
        mockUserService.getUser.mockResolvedValue({
            user: mockUser,
            access_token: 'token',
        });

        const result = await controller.getUser({ id: 1 });
        expect(mockUserService.getUser).toHaveBeenCalledWith(1);
        expect(result).toEqual({ user: mockUser, access_token: 'token' });
    });

    it('should call userService.update() with body and user id', async () => {
        const dto: UpdateUserBodyDto = {
            username: 'updatedUser',
        };

        mockUserService.update.mockResolvedValue({
            user: mockUser,
            access_token: 'token',
        });

        const result = await controller.update({ id: 1 }, dto);
        expect(mockUserService.update).toHaveBeenCalledWith(dto, 1);
        expect(result).toEqual({ user: mockUser, access_token: 'token' });
    });
});
