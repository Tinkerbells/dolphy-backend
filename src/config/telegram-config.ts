import { registerAs } from '@nestjs/config';
import { IsString, IsOptional } from 'class-validator';
import validateConfig from '../utils/validate-config';
import { TelegramConfig } from './telegram-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  TELEGRAM_BOT_TOKEN: string;
}

export default registerAs<TelegramConfig>('telegram', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  };
});
