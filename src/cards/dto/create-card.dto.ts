import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ example: 'Привет' })
  @IsString()
  @IsNotEmpty()
  front: string;

  @ApiProperty({ example: 'Hello' })
  @IsString()
  @IsNotEmpty()
  back: string;

  @ApiPropertyOptional({ example: 'Используется при приветствии' })
  @IsString()
  @IsOptional()
  hint?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  deckId: string;
}
