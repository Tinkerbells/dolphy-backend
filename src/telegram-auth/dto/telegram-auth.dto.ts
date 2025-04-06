import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TelegramAuthDto {
  @ApiProperty({ description: 'Данные инициализации от Telegram Mini App' })
  @IsString()
  @IsNotEmpty()
  initData: string;
}
