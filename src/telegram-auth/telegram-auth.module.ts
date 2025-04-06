import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramAuthController } from './telegram-auth.controller';
import { TelegramAuthService } from './telegram-auth.service';
import { UsersModule } from '../users/users.module';
import { SessionModule } from '../session/session.module';
import { AllConfigType } from '../config/config.type';

@Module({
  imports: [
    UsersModule,
    SessionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        secret: configService.get('auth.secret', { infer: true }),
        signOptions: {
          expiresIn: configService.get('auth.expires', { infer: true }),
        },
      }),
    }),
  ],
  controllers: [TelegramAuthController],
  providers: [TelegramAuthService],
  exports: [TelegramAuthService],
})
export class TelegramAuthModule {}
