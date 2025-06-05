import { ApiProperty } from '@nestjs/swagger';
import { Card } from 'src/cards/domain/card';

export type StateType = 'New' | 'Learning' | 'Review' | 'Relearning';

export enum State {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

export type RatingType = 'Manual' | 'Again' | 'Hard' | 'Good' | 'Easy';

export enum Rating {
  Manual = 0,
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

export class FsrsCard {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Уникальный идентификатор карточки FSRS',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор связанной карточки с контентом',
  })
  cardId: string;

  @ApiProperty({
    type: Date,
    description: 'Дата следующего повторения',
  })
  due: Date;

  @ApiProperty({
    type: Number,
    example: 0.5,
    description: 'Стабильность запоминания',
  })
  stability: number;

  @ApiProperty({
    type: Number,
    example: 5.0,
    description: 'Сложность карточки',
  })
  difficulty: number;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Количество дней с последнего повторения',
  })
  elapsed_days: number;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Запланированное количество дней до следующего повторения',
  })
  scheduled_days: number;

  @ApiProperty({
    type: Number,
    example: 0,
    description: 'Количество повторений',
  })
  reps: number;

  @ApiProperty({
    type: Number,
    example: 0,
    description: 'Количество ошибок',
  })
  lapses: number;

  @ApiProperty({
    type: String,
    enum: State,
    example: '0',
    description: 'Состояние карточки в процессе обучения',
  })
  state: State;

  @ApiProperty({
    type: Date,
    nullable: true,
    description: 'Дата последнего повторения',
  })
  last_review?: Date;

  @ApiProperty({
    type: Date,
    description: 'Дата до которой карточка приостановлена',
  })
  suspended: Date;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Флаг удаления',
  })
  deleted: boolean;

  @ApiProperty({
    type: Date,
    description: 'Дата создания',
  })
  createdAt: Date;
}

export class FsrsCardWithContent extends FsrsCard {
  @ApiProperty({
    type: () => Card,
    description: 'Карточка с контентом (вопрос, ответ и метаданные)',
  })
  card: Card;
}
