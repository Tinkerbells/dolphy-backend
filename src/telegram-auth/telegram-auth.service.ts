import * as crypto from 'crypto';
import {
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramProfile } from './entities/telegram-profile.entity';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { UsersService } from '../users/users.service';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';

@Injectable()
export class TelegramAuthService {
  constructor(
    @InjectRepository(TelegramProfile)
    private readonly telegramProfileRepository: Repository<TelegramProfile>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  // Проверка данных аутентификации Telegram
  verifyTelegramData(data: TelegramAuthDto): boolean {
    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN', {
      infer: true,
    });
    if (!botToken) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          token: 'botTokenNotConfigured',
        },
      });
    }

    // Создаем строку для проверки
    const dataCheckString = Object.keys(data)
      .filter((key) => key !== 'hash')
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');

    // Создаем секретный ключ
    const secretKey = createHash('sha256').update(botToken).digest();

    // Вычисляем хеш
    const computedHash = createHash('sha256')
      .update(dataCheckString)
      .update(secretKey)
      .digest('hex');

    // Проверяем, совпадает ли хеш из запроса с вычисленным хешем
    console.log(data.hash, computedHash);
    return data.hash === computedHash;
  }

  // Метод для аутентификации пользователя Telegram
  async authenticateUser(telegramAuthDto: TelegramAuthDto) {
    // Проверяем данные аутентификации
    const isValid = this.verifyTelegramData(telegramAuthDto);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram authentication data');
    }

    // Проверяем не истек ли срок действия данных аутентификации (24 часа)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp - telegramAuthDto.auth_date > 86400) {
      throw new UnauthorizedException('Authentication data expired');
    }

    // Ищем существующий профиль Telegram
    let telegramProfile = await this.telegramProfileRepository.findOne({
      where: { telegramId: telegramAuthDto.id },
      relations: ['user'],
    });

    // Если профиль не найден, создаем новый профиль и пользователя
    if (!telegramProfile) {
      // Создаем нового пользователя
      const user = await this.usersService.create({
        firstName: telegramAuthDto.first_name,
        lastName: telegramAuthDto.last_name || null,
        email: null, // У пользователей Telegram может не быть email
        provider: AuthProvidersEnum.telegram,
        socialId: telegramAuthDto.id.toString(),
        role: { id: RoleEnum.user },
        status: { id: StatusEnum.active },
      });

      // Создаем новый профиль Telegram
      // Создаем новый профиль Telegram
      telegramProfile = this.telegramProfileRepository.create({
        telegramId: Number(telegramAuthDto.id), // Приводим к типу number
        username: telegramAuthDto.username,
        firstName: telegramAuthDto.first_name,
        lastName: telegramAuthDto.last_name,
        photoUrl: telegramAuthDto.photo_url,
        authDate: new Date(telegramAuthDto.auth_date * 1000),
        user: { id: Number(user.id) }, // Приводим к типу number
      });

      await this.telegramProfileRepository.save(telegramProfile);
    } else {
      // Обновляем существующий профиль
      telegramProfile.username = telegramAuthDto.username;
      telegramProfile.firstName = telegramAuthDto.first_name;
      telegramProfile.lastName = telegramAuthDto.last_name;
      telegramProfile.photoUrl = telegramAuthDto.photo_url;
      telegramProfile.authDate = new Date(telegramAuthDto.auth_date * 1000);

      await this.telegramProfileRepository.save(telegramProfile);
    }

    // Возвращаем данные пользователя
    return this.usersService.findById(telegramProfile.user.id);
  }

  // Метод для получения профиля пользователя по telegramId
  async findProfileByTelegramId(
    telegramId: number,
  ): Promise<TelegramProfile | null> {
    return this.telegramProfileRepository.findOne({
      where: { telegramId },
      relations: ['user'],
    });
  }
  createMockTelegramUser(
    userData: Partial<TelegramAuthDto> = {},
  ): TelegramAuthDto {
    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN', {
      infer: true,
    });
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN не настроен');
    }

    // Базовые данные пользователя
    const mockUser: TelegramAuthDto = {
      id: userData.id || 12345678,
      first_name: userData.first_name || 'Test',
      last_name: userData.last_name || 'User',
      username: userData.username || 'testuser',
      photo_url:
        userData.photo_url || 'https://t.me/i/userpic/320/username.jpg',
      auth_date: Math.floor(Date.now() / 1000),
      hash: '', // Временно пустой
    };

    // Создаем строку данных для проверки (без hash)
    const dataCheckString = Object.entries(mockUser)
      .filter(([key]) => key !== 'hash')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ из токена бота
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    // Вычисляем hash
    mockUser.hash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return mockUser;
  }
}
