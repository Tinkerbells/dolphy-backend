import { PartialType } from '@nestjs/swagger';
import { CreateDecksDto } from './create-decks.dto';

export class UpdateDecksDto extends PartialType(CreateDecksDto) {}
