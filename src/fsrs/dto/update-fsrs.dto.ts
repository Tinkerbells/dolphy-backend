// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateFsrsDto } from './create-fsrs.dto';

export class UpdateFsrsDto extends PartialType(CreateFsrsDto) {}
