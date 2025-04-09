import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCardsDto {
  @ApiProperty({
    description: 'Лицевая сторона карточки (вопрос)',
    example: 'to go (прошедшее время)',
  })
  @IsString()
  @IsNotEmpty()
  front: string;

  @ApiProperty({
    description: 'Обратная сторона карточки (ответ)',
    example: 'went',
  })
  @IsString()
  @IsNotEmpty()
  back: string;

  @ApiProperty({
    description: 'Подсказка для карточки',
    example: 'Используется для обозначения перемещения в прошлом',
    required: false,
  })
  @IsString()
  @IsOptional()
  hint?: string;

  @ApiProperty({
    description: 'ID колоды, в которую добавляется карточка',
    example: '9f7b5f8e-7b3c-4b9c-8b0a-1d4a7b9c5d6e',
  })
  @IsUUID()
  @IsNotEmpty()
  deckId: string;
}
