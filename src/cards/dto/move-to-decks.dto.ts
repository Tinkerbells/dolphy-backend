import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class MoveToDecksDto {
  @ApiProperty({
    type: [String],
    description: 'Массив идентификаторов колод',
    example: [
      'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
      'dbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  deckIds: string[];
}
