import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { UsersService } from '../../users/users.service';
import { AllConfigType } from '../../config/config.type';
import { Strategy } from 'passport-anonymous';

@Injectable()
export class TelegramStrategy extends PassportStrategy(Strategy, 'telegram') {
  constructor(
    private configService: ConfigService<AllConfigType>,
    private usersService: UsersService,
  ) {
    super();
  }

  async validate(request: Request): Promise<any> {
    const loginData = request.body;

    if (!loginData || !this.verifyTelegramLogin(loginData)) {
      throw new UnauthorizedException('Invalid Telegram login data');
    }

    const user = await this.usersService.findBySocialIdAndProvider({
      socialId: loginData.id.toString(),
      provider: 'telegram',
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private verifyTelegramLogin(loginData: any): boolean {
    // Get the bot token from config
    const botToken = this.configService.get('telegram.botToken', {
      infer: true,
    });
    if (!botToken) {
      return false;
    }

    // Check if the auth_date is not older than 24 hours
    const authDate = parseInt(loginData.auth_date);
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authDate > 86400) {
      return false;
    }

    // Prepare data for verification
    const dataCheckString = Object.keys(loginData)
      .filter((key) => key !== 'hash')
      .sort()
      .map((key) => `${key}=${loginData[key]}`)
      .join('\n');

    // Create a secret key using SHA-256
    // Добавляем String() для явного преобразования botToken в строку
    const secretKey = crypto
      .createHash('sha256')
      .update(String(botToken))
      .digest();

    // Create a hash using HMAC SHA-256
    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare the hash from the request with our computed hash
    return loginData.hash === hash;
  }
}
