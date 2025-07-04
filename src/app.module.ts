import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { TagsModule } from './tags/tags.module';

@Module({
    imports: [ArticlesModule, UserModule, PrismaModule, AuthModule, ProfilesModule, TagsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
