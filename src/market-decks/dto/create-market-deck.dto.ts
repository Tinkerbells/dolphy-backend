import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMarketDeckDto {
  @ApiProperty({
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор оригинальной колоды',
  })
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  deckId: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    default: true,
    description: 'Флаг публичной доступности колоды',
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    default: true,
    description: 'Флаг разрешения копирования колоды',
  })
  @IsBoolean()
  @IsOptional()
  isCopyAllowed?: boolean;
}
