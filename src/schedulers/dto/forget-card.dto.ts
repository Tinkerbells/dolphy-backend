import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class ForgetCardDto {
  @ApiProperty({ description: 'ID карточки', example: 123 })
  @IsNumber()
  cid: number;

  @ApiPropertyOptional({
    description: 'Сбросить счетчик повторений',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  reset_count?: boolean;
}
