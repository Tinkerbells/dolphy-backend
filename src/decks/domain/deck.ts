import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardLimits } from 'src/fsrs/domain/card-limits';
import { FSRSParameters } from 'src/fsrs/domain/fsrs-parameters';

/**
 * Доменная сущность колоды
 */
export class Deck {
  /**
   * Уникальный идентификатор колоды
   */
  @ApiProperty({
    description: 'Уникальный идентификатор колоды',
    example: 123,
  })
  id: number;

  /**
   * Название колоды
   */
  @ApiProperty({
    description: 'Название колоды',
    example: 'Английские слова',
  })
  name: string;

  /**
   * Описание колоды
   */
  @ApiPropertyOptional({
    description: 'Описание колоды',
    example: 'Колода для изучения английских слов',
  })
  description?: string;

  /**
   * Параметры алгоритма FSRS
   */
  @ApiProperty({
    description: 'Параметры алгоритма FSRS',
  })
  fsrs: FSRSParameters;

  /**
   * Лимиты карточек
   */
  @ApiProperty({
    description: 'Лимиты карточек',
  })
  card_limit: CardLimits;

  /**
   * Флаг удаления (мягкое удаление)
   */
  @ApiProperty({
    description: 'Флаг удаления (мягкое удаление)',
    example: false,
  })
  deleted: boolean;

  /**
   * ID пользователя-владельца колоды
   */
  @ApiProperty({
    description: 'ID пользователя-владельца колоды',
    example: 42,
  })
  uid: number;

  /**
   * Количество карточек в колоде
   */
  @ApiProperty({
    description: 'Количество карточек в колоде',
    example: 100,
  })
  cardsCount: number;

  /**
   * Дата создания колоды
   */
  @ApiProperty({
    description: 'Дата создания колоды',
    example: 1681459200000,
  })
  createdAt: number;

  /**
   * Дата последнего обновления колоды
   */
  @ApiProperty({
    description: 'Дата последнего обновления колоды',
    example: 1681459200000,
  })
  updatedAt: number;
}
