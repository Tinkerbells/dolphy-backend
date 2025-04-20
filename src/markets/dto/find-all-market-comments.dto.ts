import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class FindAllMarketCommentsDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Фильтрация по идентификатору колоды',
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @IsString()
  @IsUUID('4')
  @IsOptional()
  marketDeckId?: string;

  @ApiPropertyOptional({
    description: 'Фильтрация по идентификатору пользователя',
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @IsString()
  @IsUUID('4')
  @IsOptional()
  userId?: string;
}
