// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateCardsDto } from './create-cards.dto';

export class UpdateCardsDto extends PartialType(CreateCardsDto) {}
