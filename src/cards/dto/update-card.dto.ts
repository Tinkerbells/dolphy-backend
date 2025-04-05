import { PartialType } from '@nestjs/swagger';
import { CreateCardDto } from './create-card.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsUUID()
  @IsOptional()
  deckId?: string;
}
