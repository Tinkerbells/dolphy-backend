import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TelegramAuthDto {
  @ApiProperty({ example: 123456789 })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'john_doe', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({
    example: 'https://t.me/i/userpic/123/photo.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  photo_url?: string;

  @ApiProperty({ example: 1617369652 })
  @IsNumber()
  @IsNotEmpty()
  auth_date: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hash: string;
}
