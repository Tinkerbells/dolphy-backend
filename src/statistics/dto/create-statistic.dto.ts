import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * DTO для создания новой записи статистики
 */
export class CreateStatisticDto {
  /**
   * ID колоды
   */
  @ApiProperty({
    description: 'ID колоды',
    example: 123,
  })
  @IsNumber()
  @IsNotEmpty()
  did: number;

  /**
   * ID карточки (опционально)
   */
  @ApiPropertyOptional({
    description: 'ID карточки',
    example: 456,
  })
  @IsNumber()
  @IsOptional()
  cid?: number;

  /**
   * Тип статистики (daily_review, card_performance, etc.)
   */
  @ApiProperty({
    description: 'Тип статистики',
    example: 'daily_review',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  /**
   * Данные статистики в формате JSON
   */
  @ApiProperty({
    description: 'Данные статистики',
    example: {
      cardsStudied: 25,
      correctAnswers: 18,
      timeSpentMs: 1200000,
    },
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
