import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindAllDecksDto {
  /**
   * Номер страницы (по умолчанию 1)
   */
  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  /**
   * Количество записей на странице (по умолчанию 10)
   */
  @ApiPropertyOptional({
    description: 'Количество записей на странице',
    example: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  /**
   * Включать удаленные колоды
   */
  @ApiPropertyOptional({
    description: 'Включать удаленные колоды',
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
