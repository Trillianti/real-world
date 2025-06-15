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

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    create(@Body() body: CreateUserBodyDto) {
        return this.userService.create(body);
    }

    @Post('/login')
    login(@Body() body: LoginUserBodyDto) {
        return this.userService.login(body);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getUser(@User() user: { id: number }) {
        return this.userService.getUser(user.id);
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    update(@User() user: { id: number }, @Body() body: any) {
        return this.userService.update(body, user.id);
    }
}
