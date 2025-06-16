import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Res,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { LoginUserBodyDto } from './dto/login-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { userInterface } from 'src/common/interfaces/user.interface';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async create(@Body() body: CreateUserBodyDto) {
        return this.userService.create(body);
    }

    @Post('/login')
    async login(@Body() body: LoginUserBodyDto) {
        return this.userService.login(body);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUser(@User() user: userInterface) {
        return this.userService.getUser(user.id);
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    async update(@User() user: userInterface, @Body() body: any) {
        return this.userService.update(body, user.id);
    }
}
