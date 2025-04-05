import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TelegramAuthService } from './telegram-auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { User } from '../users/domain/user';
import { NullableType } from 'src/utils/types/nullable.type';

@ApiTags('Telegram Auth')
@Controller({
  path: 'telegram-auth',
  version: '1',
})
export class TelegramAuthController {
  constructor(private readonly telegramAuthService: TelegramAuthService) {}

  @Post('login')
  @ApiOkResponse({
    type: User,
    description: 'Аутентификация пользователя через Telegram',
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() telegramAuthDto: TelegramAuthDto,
  ): Promise<NullableType<User>> {
    return this.telegramAuthService.authenticateUser(telegramAuthDto);
  }
  // В telegram-auth.controller.ts
  @Post('dev/mock-user')
  @ApiOperation({
    summary: 'Создать тестового пользователя Telegram (только для разработки)',
  })
  @ApiOkResponse({
    description: 'Данные мокового пользователя Telegram с валидным hash',
    type: TelegramAuthDto,
  })
  createMockUser(@Body() userData: Partial<TelegramAuthDto> = {}) {
    // Проверяем, что не в production
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException(
        'Этот эндпоинт доступен только для разработки',
      );
    }

    return this.telegramAuthService.createMockTelegramUser(userData);
  }
}
