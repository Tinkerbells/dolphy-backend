import * as crypto from 'crypto';
import ms from 'ms';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { parse, isValid } from '@telegram-apps/init-data-node';
import { User } from '../users/domain/user';
import { UsersService } from '../users/users.service';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { SessionService } from '../session/session.service';
import { AllConfigType } from 'src/config/config.type';
import { Session } from 'src/session/domain/session';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto';

@Injectable()
export class TelegramAuthService {
  constructor(
    private configService: ConfigService<AllConfigType>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  /**
   * Проверяет данные аутентификации Telegram и создает/обновляет пользователя
   *
   * @param {string} initData - Данные инициализации от Telegram
   * @returns {Promise<User>} Пользователь после аутентификации
   */
  async authenticateUser(initData: string): Promise<LoginResponseDto> {
    // Проверяем валидность initData
    const botToken = this.configService.get('telegram.botToken', {
      infer: true,
    });
    if (!botToken) {
      throw new BadRequestException('Токен бота не настроен');
    }

    const isInitDataValid = isValid(initData, botToken);

    if (!isInitDataValid) {
      throw new BadRequestException('Неверные данные инициализации');
    }

    // Парсим данные и получаем информацию о пользователе Telegram
    const parsedData = parse(initData);
    const telegramUser = parsedData.user;

    if (!telegramUser || !telegramUser.id) {
      throw new BadRequestException('Данные пользователя отсутствуют');
    }

    // Ищем пользователя в базе или создаем нового

    const role = {
      id: RoleEnum.user,
    };

    let user = await this.usersService.findBySocialIdAndProvider({
      socialId: telegramUser.id.toString(),
      provider: AuthProvidersEnum.telegram,
    });

    if (!user) {
      user = await this.usersService.create({
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || null,
        email: null, // У пользователей Telegram может не быть email
        provider: AuthProvidersEnum.telegram,
        socialId: telegramUser.id.toString(),
        role,
        status: { id: StatusEnum.active },
      });

      if (!user) {
        throw new BadRequestException('Не удалось создать пользователя');
      }

      // Получаем полные данные пользователя
      user = await this.usersService.findById(user.id);
    }

    if (!user) {
      throw new NotFoundException(
        'Не удалось найти пользователя после создания',
      );
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    // Создаем сессию для пользователя
    const session = await this.sessionService.create({
      user,
      hash,
    });

    // Получаем токены с помощью вспомогательного метода
    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      hash,
    });

    // Возвращаем данные аутентификации
    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  /**
   * Генерирует токены для аутентифицированного пользователя
   */
  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  /**
   * Уничтожает сессию пользователя
   *
   * @param {string | number} sessionId - ID сессии
   * @returns {Promise<void>}
   */
  async destroySession(sessionId: string | number): Promise<void> {
    await this.sessionService.deleteById(sessionId);
  }
}
