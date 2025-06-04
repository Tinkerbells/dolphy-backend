import { ApiProperty } from '@nestjs/swagger';
import { Card } from '../../cards/domain/card';
import { FsrsCard } from '../domain/fsrs-card';

export class CardActionResponseDto {
  @ApiProperty({ type: () => Card })
  card: Card;

  @ApiProperty({ type: () => FsrsCard })
  fsrsCard: FsrsCard;

  @ApiProperty({
    description: 'Сообщение о результате операции',
    example: 'Карточка успешно оценена',
  })
  message?: string;
}
