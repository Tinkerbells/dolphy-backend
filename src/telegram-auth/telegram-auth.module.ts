import { Module } from '@nestjs/common';
import { TelegramAuthController } from './telegram-auth.controller';
import { TelegramAuthService } from './telegram-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramProfile } from './entities/telegram-profile.entity';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([TelegramProfile]),
    UsersModule,
    ConfigModule,
  ],
  controllers: [TelegramAuthController],
  providers: [TelegramAuthService],
  exports: [TelegramAuthService],
})
export class TelegramAuthModule {}
