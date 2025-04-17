import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDeckDto {
  @ApiProperty({
    example: 'Японский язык',
    description: 'Название колоды',
  })
  @IsString()
  @IsNotEmpty({ message: 'Название колоды обязательно' })
  @MaxLength(100, {
    message: 'Название колоды должно быть не более 100 символов',
  })
  name: string;

  @ApiProperty({
    example: 'Колода для изучения японских иероглифов',
    description: 'Описание колоды',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Описание должно быть не более 500 символов' })
  description?: string;
}
