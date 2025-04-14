import { PartialType } from '@nestjs/swagger';
import { CreateDeckDto } from './create-decks.dto';

export class UpdateDeckDto extends PartialType(CreateDeckDto) {}
