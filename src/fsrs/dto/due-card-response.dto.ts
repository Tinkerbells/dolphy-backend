import { ApiProperty } from '@nestjs/swagger';
import { Card } from '../../cards/domain/card';
import { FsrsCard } from '../domain/fsrs-card';

export class DueCardResponseDto extends FsrsCard {
  @ApiProperty({
    type: () => Card,
    description: 'Карточка с контентом (вопрос, ответ и метаданные)',
  })
  card: Card;
}
