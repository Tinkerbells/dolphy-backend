// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateMarketCommentDto } from './create-market-comment.dto';

export class UpdateMarketCommentDto extends PartialType(
  CreateMarketCommentDto,
) {}
