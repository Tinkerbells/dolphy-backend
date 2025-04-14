import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO для ссылки на статистику по ID
 */
export class StatisticDto {
  /**
   * Уникальный идентификатор записи статистики
   */
  @ApiProperty({
    description: 'Уникальный идентификатор записи статистики',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
