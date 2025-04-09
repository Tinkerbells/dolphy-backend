import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum CardAnswer {
  AGAIN = 1, // Снова (не знаю)
  HARD = 2, // Сложно (с трудом)
  GOOD = 3, // Хорошо (знаю)
  EASY = 4, // Легко (очень хорошо знаю)
}

export class AnswerCardDto {
  @ApiProperty({
    description: 'ID карточки, на которую дается ответ',
    example: '9f7b5f8e-7b3c-4b9c-8b0a-1d4a7b9c5d6e',
  })
  @IsUUID()
  @IsNotEmpty()
  cardId: string;

  @ApiProperty({
    enum: CardAnswer,
    description: 'Оценка знания карточки (1-Again, 2-Hard, 3-Good, 4-Easy)',
    example: 3,
  })
  @IsEnum(CardAnswer)
  @IsNotEmpty()
  answer: CardAnswer;
}
