import { PartialType } from '@nestjs/swagger';
import { CreateMarketDeckDto } from './create-market-deck.dto';

export class UpdateMarketDeckDto extends PartialType(CreateMarketDeckDto) {}
