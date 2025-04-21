import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMarketDeckDto {
  @ApiProperty({
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор оригинальной колоды',
  })
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  deckId: string;
}
