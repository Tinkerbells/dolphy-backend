import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { TelegramAuthService } from './telegram-auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { AllConfigType } from '../config/config.type';
import ms from 'ms';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

@ApiTags('Telegram Auth')
@Controller({
  path: 'telegram-auth',
  version: '1',
})
export class TelegramAuthController {
  constructor(
    private readonly telegramAuthService: TelegramAuthService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @ApiOperation({ summary: 'Аутентификация через Telegram Mini App' })
  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'Данные пользователя и токены доступа',
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() telegramAuthDto: TelegramAuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const loginResponse = await this.telegramAuthService.authenticateUser(
      telegramAuthDto.initData,
    );

    // Настройки для cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    // Устанавливаем cookie для access token
    response.cookie('ACCESS_TOKEN', loginResponse.token, {
      ...cookieOptions,
      expires: new Date(loginResponse.tokenExpires),
    });

    // Устанавливаем cookie для refresh token
    const refreshExpires = this.configService.getOrThrow(
      'auth.refreshExpires',
      {
        infer: true,
      },
    );

    response.cookie('REFRESH_TOKEN', loginResponse.refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + ms(refreshExpires)),
    });

    return loginResponse;
  }

  @Get('status')
  @ApiOperation({ summary: 'Проверка статуса аутентификации' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: Boolean,
    description: 'Статус аутентификации',
  })
  @HttpCode(HttpStatus.OK)
  checkStatus() {
    return true;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiNoContentResponse({ description: 'Успешный выход из системы' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request & { user: { sessionId: string | number } },
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    // Удаляем сессию
    await this.telegramAuthService.destroySession(request.user.sessionId);

    // Удаляем cookies
    response.clearCookie('ACCESS_TOKEN', { path: '/' });
    response.clearCookie('REFRESH_TOKEN', { path: '/' });
  }

  @Post('dev/mock-user')
  @ApiOperation({
    summary: 'Создать тестового пользователя Telegram (только для разработки)',
  })
  @ApiOkResponse({
    description: 'Данные мокового пользователя Telegram с валидным hash',
  })
  @HttpCode(HttpStatus.OK)
  createMockUser(@Body() userData: Partial<any> = {}) {
    // Проверяем, что не в production
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Этот эндпоинт доступен только для разработки');
    }

    return {
      id: userData.id || 12345678,
      first_name: userData.first_name || 'Test',
      last_name: userData.last_name || 'User',
      username: userData.username || 'testuser',
      photo_url:
        userData.photo_url || 'https://t.me/i/userpic/320/username.jpg',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'mock_hash', // Здесь нужна реальная логика создания хеша
    };
  }
}
