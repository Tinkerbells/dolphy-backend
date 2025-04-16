// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateReviewLogDto } from './create-review-log.dto';

export class UpdateReviewLogDto extends PartialType(CreateReviewLogDto) {}
