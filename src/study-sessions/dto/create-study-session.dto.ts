import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateStudySessionDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'ID колоды карточек',
    example: '9f7b5f8e-7b3c-4b9c-8b0a-1d4a7b9c5d6e',
  })
  @IsUUID()
  @IsNotEmpty()
  deckId: string;
}
