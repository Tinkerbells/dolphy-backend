import { ApiProperty } from '@nestjs/swagger';

export class NextCardResponseDto {
  @ApiProperty({
    description: 'Информация о следующей карточке',
    nullable: true,
  })
  card: {
    id: string;
    front: string;
    back: string;
    hint?: string;
  } | null;

  @ApiProperty({
    description: 'Прогресс изучения сессии',
    example: {
      total: 20,
      completed: 5,
      remaining: 15,
      correct: 3,
    },
  })
  progress: {
    total: number; // Общее кол-во карточек в сессии
    completed: number; // Кол-во завершенных карточек
    remaining: number; // Кол-во оставшихся карточек
    correct: number; // Кол-во правильно отвеченных карточек
  };

  @ApiProperty({
    description: 'Флаг, указывающий на завершение сессии',
    example: false,
  })
  isSessionCompleted: boolean;
}
