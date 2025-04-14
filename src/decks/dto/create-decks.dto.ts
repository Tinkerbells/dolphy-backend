import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FSRSParameters } from '../../fsrs/domain/fsrs-parameters';
import { CardLimits } from '../../fsrs/domain/card-limits';

export class CreateDeckDto {
  @ApiProperty({ description: 'Название колоды', example: 'Английские слова' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Описание колоды',
    example: 'Колода для изучения английских слов',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Параметры FSRS' })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  fsrs?: FSRSParameters;

  @ApiPropertyOptional({ description: 'Лимиты карточек' })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  card_limit?: CardLimits;
}
