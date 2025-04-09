import { PartialType } from '@nestjs/swagger';
import { CreateCardsDto } from './create-cards.dto';

export class UpdateCardsDto extends PartialType(CreateCardsDto) {}
