import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindAllNotesDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Количество записей на странице',
    example: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'ID колоды для фильтрации',
    example: 123,
  })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  deckId?: number;

  @ApiPropertyOptional({
    description: 'Ключевое слово для поиска',
    example: 'история',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Включать удаленные заметки',
    example: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  deleted?: boolean;
}
