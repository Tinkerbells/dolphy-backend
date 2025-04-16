// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateDeckDto } from './create-deck.dto';

export class UpdateDeckDto extends PartialType(CreateDeckDto) {}
